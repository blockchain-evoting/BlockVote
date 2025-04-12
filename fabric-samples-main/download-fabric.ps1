$ErrorActionPreference = "Stop"

$FABRIC_VERSION = "2.2.0"
$CA_VERSION = "1.4.9"

Write-Host "Downloading Hyperledger Fabric binaries..."
Write-Host "Fabric version: $FABRIC_VERSION"
Write-Host "Fabric CA version: $CA_VERSION"

# Create bin directory if it doesn't exist
if (-not (Test-Path "bin")) {
    New-Item -ItemType Directory -Path "bin" | Out-Null
}

# Download the Fabric binaries
$BinariesURL = "https://github.com/hyperledger/fabric/releases/download/v$FABRIC_VERSION/hyperledger-fabric-windows-amd64-$FABRIC_VERSION.tar.gz"
$BinariesFile = "hyperledger-fabric-windows-amd64-$FABRIC_VERSION.tar.gz"

Write-Host "Downloading Fabric binaries from $BinariesURL"
Invoke-WebRequest -Uri $BinariesURL -OutFile $BinariesFile

# Extract the binaries
Write-Host "Extracting Fabric binaries..."
tar -xzf $BinariesFile

# Download Fabric CA
$CABinariesURL = "https://github.com/hyperledger/fabric-ca/releases/download/v$CA_VERSION/hyperledger-fabric-ca-windows-amd64-$CA_VERSION.tar.gz"
$CABinariesFile = "hyperledger-fabric-ca-windows-amd64-$CA_VERSION.tar.gz"

Write-Host "Downloading Fabric CA binaries from $CABinariesURL"
Invoke-WebRequest -Uri $CABinariesURL -OutFile $CABinariesFile

# Extract the CA binaries
Write-Host "Extracting Fabric CA binaries..."
tar -xzf $CABinariesFile

# Pull Docker images
Write-Host "Pulling Docker images..."
$DOCKER_IMAGES = @(
    "hyperledger/fabric-peer:$FABRIC_VERSION",
    "hyperledger/fabric-orderer:$FABRIC_VERSION",
    "hyperledger/fabric-ccenv:$FABRIC_VERSION",
    "hyperledger/fabric-tools:$FABRIC_VERSION",
    "hyperledger/fabric-ca:$CA_VERSION",
    "hyperledger/fabric-couchdb:latest"
)

foreach ($IMAGE in $DOCKER_IMAGES) {
    Write-Host "Pulling $IMAGE"
    docker pull $IMAGE
}

# Clean up downloaded archives
Remove-Item $BinariesFile
Remove-Item $CABinariesFile

Write-Host "Hyperledger Fabric environment setup complete!"
