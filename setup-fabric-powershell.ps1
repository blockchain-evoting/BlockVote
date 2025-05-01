# Set environment variables
$env:FABRIC_CFG_PATH = "$((Get-Location).Path)\config"
$env:PATH = "$((Get-Location).Path)\bin;$env:PATH"

# Create necessary directories
New-Item -ItemType Directory -Force -Path ".\bin" | Out-Null
New-Item -ItemType Directory -Force -Path ".\config" | Out-Null

# Set up organization environment variables
$env:CORE_PEER_TLS_ENABLED="true"
$env:CORE_PEER_LOCALMSPID="Org1MSP"
$env:CORE_PEER_ADDRESS="localhost:7051"
$env:CORE_PEER_TLS_ROOTCERT_FILE="$((Get-Location).Path)\crypto-config\peerOrganizations\org1.example.com\peers\peer0.org1.example.com\tls\ca.crt"
$env:CORE_PEER_MSPCONFIGPATH="$((Get-Location).Path)\crypto-config\peerOrganizations\org1.example.com\users\Admin@org1.example.com\msp"
$env:ORDERER_CA="$((Get-Location).Path)\crypto-config\ordererOrganizations\example.com\orderers\orderer.example.com\msp\tlscacerts\tlsca.example.com-cert.pem"

Write-Host "Environment variables set successfully!"
Write-Host "FABRIC_CFG_PATH: $env:FABRIC_CFG_PATH"
Write-Host "Peer Organization: $env:CORE_PEER_LOCALMSPID"

# Check if Docker is running
$dockerStatus = docker ps 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Docker is running and ready"
} else {
    Write-Host "Warning: Docker is not running. Please start Docker Desktop"
    exit 1
}
