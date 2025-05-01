# BlockVote Network Startup Script
# This script combines all the successful commands to start the BlockVote network

Write-Host "BlockVote Network Startup Script" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Step 1: Clean up any existing containers and networks
Write-Host "`nStep 1: Cleaning up existing containers and networks..." -ForegroundColor Cyan
docker stop $(docker ps -aq) 2>$null
docker rm $(docker ps -aq) 2>$null
docker network prune -f

# Step 2: Set environment variables
Write-Host "`nStep 2: Setting environment variables..." -ForegroundColor Cyan
$env:FABRIC_CFG_PATH = "$PWD\fabric-samples-main\test-network\configtx"
$TEST_NETWORK_PATH = "$PWD\fabric-samples-main\test-network"

# Step 3: Navigate to test network directory and start the network components
Write-Host "`nStep 3: Starting network components..." -ForegroundColor Cyan
Set-Location $TEST_NETWORK_PATH

# Start the network using docker-compose
Write-Host "Starting containers with docker-compose..." -ForegroundColor Yellow
docker-compose -f compose/compose-test-net.yaml -f compose/compose-couch.yaml -f compose/compose-ca.yaml up -d

# Wait for containers to stabilize
Write-Host "Waiting for containers to stabilize..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Step 4: Create the channel
Write-Host "`nStep 4: Creating the evotingchannel..." -ForegroundColor Cyan
.\network.sh createChannel -c evotingchannel

# Step 5: Deploy the chaincode
Write-Host "`nStep 5: Deploying the evoting chaincode..." -ForegroundColor Cyan
.\network.sh deployCC -ccn evoting -ccp ./chaincode/evoting-chaincode -ccl typescript

# Step 6: Test the chaincode
Write-Host "`nStep 6: Testing the evoting chaincode..." -ForegroundColor Cyan
.\test-evoting-chaincode.ps1

# Step 7: Verify the network status
Write-Host "`nStep 7: Verifying network status..." -ForegroundColor Cyan
Write-Host "Running containers:" -ForegroundColor Yellow
docker ps

Write-Host "`nBlockVote Network Setup Complete!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host "The following components are running:"
Write-Host "- Orderer service"
Write-Host "- Peer nodes (org1 and org2)"
Write-Host "- CouchDB state database"
Write-Host "- Certificate Authorities"
Write-Host "- Channel: evotingchannel"
Write-Host "- Chaincode: evoting"

# Return to original directory
Set-Location -
