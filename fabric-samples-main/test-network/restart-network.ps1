# Restart Hyperledger Fabric Network for E-Voting System

# Change to the test-network directory
Set-Location $PSScriptRoot

# Print current directory and contents
Write-Host "Current Directory: $(Get-Location)"
Write-Host "Listing contents:"
Get-ChildItem

# Verify network.sh exists
if (-Not (Test-Path .\network.sh)) {
    Write-Host "Error: network.sh script not found!"
    exit 1
}

# Stop existing network
Write-Host "Stopping existing network..."
& ./network.sh down

# Start the network and create channel
Write-Host "Starting network and creating evoting-channel..."
& ./network.sh up createChannel -c evoting-channel -ca

# Deploy chaincode
Write-Host "Deploying evoting-chaincode..."
& ./network.sh deployCC -ccn evoting-chaincode -ccp ../evoting-chaincode -ccl typescript

# Verify network status
Write-Host "Network restart complete."
docker ps