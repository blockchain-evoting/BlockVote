$ErrorActionPreference = "Stop"

# Create bin directory if it doesn't exist
$binDir = ".\bin"
if (-not (Test-Path $binDir)) {
    New-Item -ItemType Directory -Path $binDir
}

# Download Fabric binaries
$version = "2.5.0"
$arch = "windows-amd64"
$baseUrl = "https://github.com/hyperledger/fabric/releases/download"

$binaries = @(
    "peer.exe",
    "orderer.exe",
    "configtxgen.exe"
)

foreach ($binary in $binaries) {
    $url = "$baseUrl/v$version/$binary-$version-$arch.exe"
    $output = Join-Path $binDir $binary
    
    Write-Host "Downloading $binary..."
    Invoke-WebRequest -Uri $url -OutFile $output
}

# Add bin directory to PATH for this session
$env:PATH = "$((Get-Location).Path)\bin;$env:PATH"

# Set Fabric environment variables
$env:FABRIC_CFG_PATH = "$((Get-Location).Path)\config"
if (-not (Test-Path $env:FABRIC_CFG_PATH)) {
    New-Item -ItemType Directory -Path $env:FABRIC_CFG_PATH
}

Write-Host "Fabric binaries have been downloaded and environment variables set."
Write-Host "Testing peer command..."
peer version
