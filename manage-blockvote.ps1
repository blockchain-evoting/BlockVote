# BlockVote Application Management Script
param(
    [Parameter(Position=0)]
    [ValidateSet('start', 'stop', 'restart', 'status', 'start-mock')]
    [string]$Command = 'status',
    
    [Parameter()]
    [switch]$SkipBlockchain,
    
    [Parameter()]
    [switch]$SkipFrontend,
    
    [Parameter()]
    [switch]$SkipApi
)

$API_PORT = 3000
$FRONTEND_PORT = 5173
$TEST_NETWORK_PATH = "$PSScriptRoot\fabric-samples-main\test-network"

function Get-ActualApiPort {
    # Check if the .api-port file exists and read the actual port
    $apiPortFile = "$PSScriptRoot\.api-port"
    if (Test-Path $apiPortFile) {
        $actualPort = Get-Content $apiPortFile -Raw
        return $actualPort.Trim()
    }
    return $API_PORT
}

function Write-Status {
    Write-Host "`nBlockVote Status:" -ForegroundColor Cyan
    
    # Check Docker containers
    $containers = docker ps --format "{{.Names}}"
    Write-Host "`nBlockchain Network Status:" -ForegroundColor Yellow
    if ($containers) {
        Write-Host "Running Containers:" -ForegroundColor Green
        $containers | ForEach-Object { Write-Host "- $_" }
    } else {
        Write-Host "No containers running" -ForegroundColor Red
    }

    # Check API Server
    Write-Host "`nAPI Server Status:" -ForegroundColor Yellow
    $apiProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*server.ts*" }
    if ($apiProcess) {
        $actualApiPort = Get-ActualApiPort
        Write-Host "API Server is running at http://localhost:$actualApiPort" -ForegroundColor Green
        
        # Check if running in mock mode
        $isMockMode = $env:MOCK_MODE -eq "true"
        if ($isMockMode) {
            Write-Host "API Server is running in MOCK MODE" -ForegroundColor Yellow
        }
    } else {
        Write-Host "API Server is not running" -ForegroundColor Red
    }

    # Check frontend
    Write-Host "`nFrontend Status:" -ForegroundColor Yellow
    $frontendProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*vite*" }
    if ($frontendProcess) {
        Write-Host "Frontend is running at http://localhost:$FRONTEND_PORT" -ForegroundColor Green
    } else {
        Write-Host "Frontend is not running" -ForegroundColor Red
    }
}

function Start-BlockchainNetwork {
    Write-Host "`n=== Starting Blockchain Network ===" -ForegroundColor Cyan
    
    # Step 1: Clean up any existing containers and networks
    Write-Host "Step 1: Cleaning up existing containers and networks..." -ForegroundColor Yellow
    docker stop $(docker ps -aq) 2>$null
    docker rm $(docker ps -aq) 2>$null
    docker network prune -f
    
    # Step 2: Set environment variables
    Write-Host "Step 2: Setting environment variables..." -ForegroundColor Yellow
    $env:FABRIC_CFG_PATH = "$PSScriptRoot\fabric-samples-main\test-network\configtx"
    
    # Step 3: Navigate to test network directory and start the network components
    Write-Host "Step 3: Starting network components..." -ForegroundColor Yellow
    Push-Location $TEST_NETWORK_PATH
    
    # Start the network using docker-compose
    Write-Host "Starting containers with docker-compose..." -ForegroundColor Yellow
    docker-compose -f compose/compose-test-net.yaml -f compose/compose-couch.yaml -f compose/compose-ca.yaml up -d
    
    # Wait for containers to stabilize
    Write-Host "Waiting for containers to stabilize..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
    
    # Step 4: Create the channel
    Write-Host "Step 4: Creating the evotingchannel..." -ForegroundColor Yellow
    ./network.sh createChannel -c evotingchannel
    
    # Step 5: Deploy the chaincode
    Write-Host "Step 5: Deploying the evoting chaincode..." -ForegroundColor Yellow
    ./network.sh deployCC -ccn evoting -ccp ./chaincode/evoting-chaincode -ccl typescript
    
    # Step 6: Test the chaincode
    Write-Host "Step 6: Testing the evoting chaincode..." -ForegroundColor Yellow
    ./test-evoting-chaincode.ps1
    
    # Return to original directory
    Pop-Location
    
    Write-Host "Blockchain Network Setup Complete!" -ForegroundColor Green
}

function Start-ApiServer {
    param (
        [switch]$MockMode
    )
    
    Write-Host "`n=== Starting API Server ===" -ForegroundColor Cyan
    
    if ($MockMode) {
        Write-Host "Starting API Server in MOCK MODE..." -ForegroundColor Yellow
        $env:MOCK_MODE = "true"
        $env:API_PORT = "3001"  # Use a consistent port for mock mode
        Write-Host "API Server will run on port $env:API_PORT with mock data" -ForegroundColor Yellow
    } else {
        $env:MOCK_MODE = "false"
        $env:API_PORT = "$API_PORT"
        Write-Host "API Server will connect to the blockchain network" -ForegroundColor Yellow
    }
    
    $apiJob = Start-Job -ScriptBlock {
        Set-Location "$using:PSScriptRoot\server"
        npm run dev
    }
    
    Write-Host "API Server starting..." -ForegroundColor Green
}

function Start-Frontend {
    Write-Host "`n=== Starting Frontend ===" -ForegroundColor Cyan
    
    $frontendJob = Start-Job -ScriptBlock {
        Set-Location $using:PSScriptRoot
        npm run dev
    }
    
    Write-Host "Frontend starting on port $FRONTEND_PORT..." -ForegroundColor Green
}

function Start-BlockVote {
    Write-Host "Starting BlockVote Application..." -ForegroundColor Cyan
    
    # Start blockchain network (unless skipped)
    if (-not $SkipBlockchain) {
        Start-BlockchainNetwork
    } else {
        Write-Host "Skipping blockchain network startup (as requested)" -ForegroundColor Yellow
    }
    
    # Start API Server (unless skipped)
    if (-not $SkipApi) {
        Start-ApiServer
    } else {
        Write-Host "Skipping API server startup (as requested)" -ForegroundColor Yellow
    }
    
    # Start frontend (unless skipped)
    if (-not $SkipFrontend) {
        Start-Frontend
    } else {
        Write-Host "Skipping frontend startup (as requested)" -ForegroundColor Yellow
    }
    
    Write-Host "`nWaiting for services to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    Write-Status
    
    Write-Host "`nBlockVote is ready!" -ForegroundColor Green
    Write-Host "- Frontend: http://localhost:$FRONTEND_PORT"
    Write-Host "- API Server: http://localhost:$(Get-ActualApiPort)"
    if (-not $SkipBlockchain) {
        Write-Host "- Blockchain Network: Running on evotingchannel"
    }
}

function Start-MockMode {
    Write-Host "Starting BlockVote in MOCK MODE..." -ForegroundColor Cyan
    
    # Stop any running services
    Stop-BlockVote -Quiet
    
    # Start API Server in mock mode
    Start-ApiServer -MockMode
    
    # Start frontend
    Start-Frontend
    
    Write-Host "`nWaiting for services to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    Write-Status
    
    Write-Host "`nBlockVote MOCK MODE is ready!" -ForegroundColor Green
    Write-Host "- Frontend: http://localhost:$FRONTEND_PORT"
    Write-Host "- API Server (MOCK): http://localhost:3001"
    Write-Host "- Blockchain Network: Not running (using mock data)"
}

function Stop-BlockVote {
    param (
        [switch]$Quiet
    )
    
    if (-not $Quiet) {
        Write-Host "Stopping BlockVote Application..." -ForegroundColor Cyan
    }
    
    # Stop API Server and Frontend
    if (-not $Quiet) {
        Write-Host "`nStopping API Server and Frontend..." -ForegroundColor Yellow
    }
    
    Get-Process -Name "node" -ErrorAction SilentlyContinue | 
        Where-Object { $_.CommandLine -like "*server.ts*" -or $_.CommandLine -like "*vite*" } | 
        Stop-Process -Force
    
    # Stop blockchain network
    if (-not $Quiet) {
        Write-Host "`nStopping Blockchain Network..." -ForegroundColor Yellow
    }
    
    docker stop $(docker ps -aq) 2>$null
    docker rm $(docker ps -aq) 2>$null
    docker network prune -f
    
    if (-not $Quiet) {
        Write-Host "`nAll services stopped" -ForegroundColor Green
    }
}

# Execute command
switch ($Command) {
    'start' { Start-BlockVote }
    'start-mock' { Start-MockMode }
    'stop' { Stop-BlockVote }
    'restart' { 
        Stop-BlockVote
        Start-Sleep -Seconds 2
        Start-BlockVote
    }
    'status' { Write-Status }
}
