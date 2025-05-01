# Set Fabric version
$FABRIC_VERSION="2.5.0"

Write-Host "Downloading Fabric binaries and Docker images..."

# Create bin directory if it doesn't exist
New-Item -ItemType Directory -Force -Path ".\fabric-samples-main\bin" | Out-Null

# Use Git Bash to download the bootstrap script (assuming Git is installed)
$gitBashPath = "C:\Program Files\Git\bin\bash.exe"

if (Test-Path $gitBashPath) {
    Write-Host "Using Git Bash to download Fabric..."
    $bootstrapUrl = "https://raw.githubusercontent.com/hyperledger/fabric/main/scripts/bootstrap.sh"
    
    # Use Git Bash to download and execute the bootstrap script
    & $gitBashPath -c "curl -sSL $bootstrapUrl | bash -s -- $FABRIC_VERSION -s -b"
    
    # Set environment variables
    $env:PATH = "$((Get-Location).Path)\fabric-samples-main\bin;$env:PATH"
    $env:FABRIC_CFG_PATH = "$((Get-Location).Path)\fabric-samples-main\config"
    
    Write-Host "Testing peer binary..."
    & $gitBashPath -c "peer version"
} else {
    Write-Host "Error: Git Bash not found. Please install Git for Windows first."
    exit 1
}
