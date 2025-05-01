# Set Fabric version
$FABRIC_VERSION="2.5.0"

# Create bin directory if it doesn't exist
$binDir = ".\bin"
New-Item -ItemType Directory -Force -Path $binDir | Out-Null

# Download binaries directly from GitHub releases
$baseUrl = "https://github.com/hyperledger/fabric/releases/download/v$FABRIC_VERSION"
$binaries = @(
    "peer.exe",
    "orderer.exe",
    "configtxgen.exe"
)

foreach ($binary in $binaries) {
    $url = "$baseUrl/$binary"
    $output = Join-Path $binDir $binary
    Write-Host "Downloading $binary from $url"
    
    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest -Uri $url -OutFile $output -UseBasicParsing
        Write-Host "Successfully downloaded $binary"
    }
    catch {
        Write-Host "Error downloading $binary`: $_"
    }
}

# Set environment variables
$env:PATH = "$((Get-Location).Path)\bin;$env:PATH"
$env:FABRIC_CFG_PATH = "$((Get-Location).Path)\config"

Write-Host "Verifying downloads..."
Get-ChildItem $binDir
