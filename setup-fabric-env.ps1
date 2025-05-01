# Set environment variables for Fabric
$env:FABRIC_CFG_PATH = "$((Get-Location).Path)\config"
$env:PATH = "$((Get-Location).Path)\bin;$env:PATH"

# Create necessary directories
New-Item -ItemType Directory -Force -Path ".\bin" | Out-Null
New-Item -ItemType Directory -Force -Path ".\config" | Out-Null

Write-Host "Downloading Fabric binaries and Docker images..."
$fabricVersion = "2.5.0"

# Download the bootstrap script
$bootstrapUrl = "https://raw.githubusercontent.com/hyperledger/fabric/main/scripts/install-fabric.sh"
$bootstrapScript = "install-fabric.sh"

# Use Git Bash to run the bootstrap script (assuming Git Bash is installed)
$gitBashPath = "C:\Program Files\Git\bin\bash.exe"
if (Test-Path $gitBashPath) {
    Write-Host "Using Git Bash to download Fabric..."
    & $gitBashPath -c "curl -sSL $bootstrapUrl | bash -s -- binary -s -f $fabricVersion"
} else {
    Write-Host "Error: Git Bash not found. Please install Git for Windows first."
    exit 1
}

# Verify the installation
if (Test-Path ".\bin\peer.exe") {
    Write-Host "Fabric binaries installed successfully!"
    Write-Host "Testing peer command..."
    .\bin\peer.exe version
} else {
    Write-Host "Error: Fabric binaries installation failed."
    exit 1
}
