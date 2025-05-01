# Stop and remove existing containers
Write-Host "Cleaning up existing containers..."
docker stop $(docker ps -aq) 2>$null
docker rm $(docker ps -aq) 2>$null

# Create necessary directories for volume mounts
Write-Host "Creating directories for volume mounts..."
$dirs = @(
    ".\config",
    ".\crypto-config\ordererOrganizations\example.com\orderers\orderer.example.com\msp",
    ".\crypto-config\peerOrganizations\org1.example.com\peers\peer0.org1.example.com\msp"
)
foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

# Create a Docker network for Fabric
Write-Host "Creating Fabric network..."
docker network create fabric-network 2>$null

# Start the CouchDB container
Write-Host "Starting CouchDB..."
docker run -d --name couchdb `
    --network fabric-network `
    -p 5984:5984 `
    -e COUCHDB_USER=admin `
    -e COUCHDB_PASSWORD=adminpw `
    hyperledger/fabric-couchdb

# Start the Fabric CA container
Write-Host "Starting Fabric CA..."
docker run -d --name fabric-ca `
    --network fabric-network `
    -p 7054:7054 `
    -e FABRIC_CA_HOME=/etc/hyperledger/fabric-ca-server `
    -e FABRIC_CA_SERVER_CA_NAME=ca.org1.example.com `
    -e FABRIC_CA_SERVER_TLS_ENABLED=false `
    -e FABRIC_CA_SERVER_PORT=7054 `
    hyperledger/fabric-ca:1.5.7 `
    fabric-ca-server start -b admin:adminpw

Write-Host "Waiting for CA to start..."
Start-Sleep -Seconds 5

# Enroll the admin user
Write-Host "Enrolling admin user..."
$env:FABRIC_CA_CLIENT_HOME = ".\crypto-config\ordererOrganizations\example.com"
docker run --rm -v "$((Get-Location).Path):/etc/hyperledger/fabric-ca-client" `
    --network fabric-network `
    hyperledger/fabric-ca:1.5.7 `
    fabric-ca-client enroll -u http://admin:adminpw@fabric-ca:7054

# Start the Orderer
Write-Host "Starting Orderer..."
docker run -d --name orderer `
    --network fabric-network `
    -p 7050:7050 `
    -v "$((Get-Location).Path)/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp:/etc/hyperledger/orderer/msp" `
    -v "$((Get-Location).Path)/config:/etc/hyperledger/config" `
    -e ORDERER_GENERAL_LOGLEVEL=debug `
    -e ORDERER_GENERAL_LISTENADDRESS=0.0.0.0 `
    -e ORDERER_GENERAL_LISTENPORT=7050 `
    -e ORDERER_GENERAL_GENESISMETHOD=file `
    -e ORDERER_GENERAL_GENESISFILE=/etc/hyperledger/config/genesis.block `
    -e ORDERER_GENERAL_LOCALMSPID=OrdererMSP `
    -e ORDERER_GENERAL_TLS_ENABLED=false `
    hyperledger/fabric-orderer:2.5.0

# Start the Peer
Write-Host "Starting Peer..."
docker run -d --name peer0.org1 `
    --network fabric-network `
    -p 7051:7051 `
    -v "$((Get-Location).Path)/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/msp:/etc/hyperledger/peer/msp" `
    -e CORE_PEER_ID=peer0.org1.example.com `
    -e CORE_PEER_ADDRESS=peer0.org1:7051 `
    -e CORE_PEER_LISTENADDRESS=0.0.0.0:7051 `
    -e CORE_PEER_CHAINCODEADDRESS=peer0.org1:7052 `
    -e CORE_PEER_CHAINCODELISTENADDRESS=0.0.0.0:7052 `
    -e CORE_PEER_GOSSIP_BOOTSTRAP=peer0.org1:7051 `
    -e CORE_PEER_GOSSIP_EXTERNALENDPOINT=peer0.org1:7051 `
    -e CORE_PEER_LOCALMSPID=Org1MSP `
    -e CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/peer/msp `
    -e CORE_OPERATIONS_LISTENADDRESS=0.0.0.0:9443 `
    -e CORE_PEER_TLS_ENABLED=false `
    -e CORE_LEDGER_STATE_STATEDATABASE=CouchDB `
    -e CORE_LEDGER_STATE_COUCHDBCONFIG_COUCHDBADDRESS=couchdb:5984 `
    -e CORE_LEDGER_STATE_COUCHDBCONFIG_USERNAME=admin `
    -e CORE_LEDGER_STATE_COUCHDBCONFIG_PASSWORD=adminpw `
    hyperledger/fabric-peer:2.5.0

Write-Host "Waiting for containers to start..."
Start-Sleep -Seconds 10

Write-Host "Checking container status..."
docker ps
