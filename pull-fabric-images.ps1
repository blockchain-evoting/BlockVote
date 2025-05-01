# Pull required Hyperledger Fabric Docker images
$FABRIC_VERSION="2.5.0"
$FABRIC_CA_VERSION="1.5.7"

Write-Host "Pulling Hyperledger Fabric Docker images..."

$images = @(
    "hyperledger/fabric-peer:$FABRIC_VERSION",
    "hyperledger/fabric-orderer:$FABRIC_VERSION",
    "hyperledger/fabric-ccenv:$FABRIC_VERSION",
    "hyperledger/fabric-tools:$FABRIC_VERSION",
    "hyperledger/fabric-ca:$FABRIC_CA_VERSION",
    "hyperledger/fabric-couchdb:latest"
)

foreach ($image in $images) {
    Write-Host "Pulling $image..."
    docker pull $image
}

Write-Host "Verifying pulled images..."
docker images | Select-String "hyperledger"
