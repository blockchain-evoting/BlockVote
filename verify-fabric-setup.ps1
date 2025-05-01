# Check and create necessary directories
$dirs = @(
    ".\config",
    ".\organizations",
    ".\channel-artifacts"
)

foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        Write-Host "Creating directory: $dir"
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }
}

# Check for Docker
Write-Host "Checking Docker..."
$dockerVersion = docker version
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Docker is not running or not installed"
    exit 1
}

# Check Docker Compose
Write-Host "Checking Docker Compose..."
$composeVersion = docker-compose version
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Docker Compose is not installed"
    exit 1
}

# Check for required Docker images
$requiredImages = @(
    "hyperledger/fabric-ca:1.5.7",
    "hyperledger/fabric-peer:latest",
    "hyperledger/fabric-orderer:latest",
    "hyperledger/fabric-couchdb:latest"
)

Write-Host "Checking required Docker images..."
foreach ($image in $requiredImages) {
    docker pull $image
}

Write-Host "Setup verification complete. Running docker ps to show current containers:"
docker ps -a
