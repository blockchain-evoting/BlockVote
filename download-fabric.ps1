# Set Fabric version
$FABRIC_VERSION="2.5.0"
$CA_VERSION="1.5.7"

# Create bin directory if it doesn't exist
New-Item -ItemType Directory -Force -Path ".\fabric-samples-main\bin" | Out-Null

# Download binaries
$binaries = @(
    "configtxgen",
    "configtxlator",
    "cryptogen",
    "discover",
    "idemixgen",
    "orderer",
    "peer",
    "fabric-ca-client"
)

Write-Host "Downloading Fabric binaries..."
foreach ($binary in $binaries) {
    $url = "https://github.com/hyperledger/fabric/releases/download/v$FABRIC_VERSION/$binary-$FABRIC_VERSION-windows-amd64.exe"
    $output = ".\fabric-samples-main\bin\$binary.exe"
    Write-Host "Downloading $binary..."
    Invoke-WebRequest -Uri $url -OutFile $output
}

# Download Fabric CA binary
$caUrl = "https://github.com/hyperledger/fabric-ca/releases/download/v$CA_VERSION/fabric-ca-client-$CA_VERSION-windows-amd64.zip"
$caOutput = ".\fabric-ca-client.zip"
Write-Host "Downloading Fabric CA Client..."
Invoke-WebRequest -Uri $caUrl -OutFile $caOutput
Expand-Archive -Path $caOutput -DestinationPath ".\fabric-samples-main\bin" -Force
Remove-Item $caOutput

Write-Host "Setting environment variables..."
$env:PATH = "$((Get-Location).Path)\fabric-samples-main\bin;$env:PATH"
$env:FABRIC_CFG_PATH = "$((Get-Location).Path)\fabric-samples-main\config"

Write-Host "Verifying installation..."
peer version
