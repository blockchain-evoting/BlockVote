# Stop and remove existing containers
Write-Host "Cleaning up existing containers..."
docker stop $(docker ps -aq) 2>$null
docker rm $(docker ps -aq) 2>$null
docker network prune -f 2>$null

# Navigate to test-network directory and start the network
Set-Location -Path ".\fabric-samples-main\test-network"

Write-Host "Starting the network..."
./network.sh down
./network.sh up createChannel -c evotingchannel -ca -s couchdb

Write-Host "Deploying the chaincode..."
./network.sh deployCC -ccn evoting -ccp ../../chaincode/evoting -ccl javascript

# Set the environment variables for the peer organization
$env:CORE_PEER_TLS_ENABLED="true"
$env:CORE_PEER_LOCALMSPID="Org1MSP"
$env:CORE_PEER_MSPCONFIGPATH="$((Get-Location).Path)/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp"
$env:CORE_PEER_TLS_ROOTCERT_FILE="$((Get-Location).Path)/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"
$env:CORE_PEER_ADDRESS="localhost:7051"

Write-Host "Network is up and running!"
Write-Host "Checking running containers..."
docker ps
