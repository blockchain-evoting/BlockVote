# Set environment variables for Fabric
$env:FABRIC_CFG_PATH = "$PWD\..\config"
$env:PATH += ";$PWD\..\bin"

# Create wallet directory in the e-voting app
$walletPath = "..\..\wallet"
if (-not (Test-Path $walletPath)) {
    New-Item -ItemType Directory -Path $walletPath | Out-Null
    Write-Host "Created wallet directory at $walletPath"
}

# Copy the connection profile
$connectionProfileDir = "..\..\connection-profile"
if (-not (Test-Path $connectionProfileDir)) {
    New-Item -ItemType Directory -Path $connectionProfileDir | Out-Null
    Write-Host "Created connection profile directory at $connectionProfileDir"
}

# Create connection profile for the application
$connectionProfile = @{
    name = "evoting-network"
    version = "1.0.0"
    client = @{
        organization = "Org1"
        connection = @{
            timeout = @{
                peer = @{
                    endorser = "300"
                    eventHub = "300"
                    eventReg = "300"
                }
                orderer = "300"
            }
        }
    }
    channels = @{
        "evoting-channel" = @{
            orderers = @("orderer.example.com")
            peers = @{
                "peer0.org1.example.com" = @{
                    endorsingPeer = $true
                    chaincodeQuery = $true
                    ledgerQuery = $true
                    eventSource = $true
                }
            }
        }
    }
    organizations = @{
        Org1 = @{
            mspid = "Org1MSP"
            peers = @("peer0.org1.example.com")
            certificateAuthorities = @("ca.org1.example.com")
        }
    }
    orderers = @{
        "orderer.example.com" = @{
            url = "grpcs://localhost:7050"
            tlsCACerts = @{
                pem = (Get-Content -Path "$PWD/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt" -Raw)
            }
            grpcOptions = @{
                "ssl-target-name-override" = "orderer.example.com"
                hostnameOverride = "orderer.example.com"
            }
        }
    }
    peers = @{
        "peer0.org1.example.com" = @{
            url = "grpcs://localhost:7051"
            tlsCACerts = @{
                pem = (Get-Content -Path "$PWD/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" -Raw)
            }
            grpcOptions = @{
                "ssl-target-name-override" = "peer0.org1.example.com"
                hostnameOverride = "peer0.org1.example.com"
            }
        }
    }
    certificateAuthorities = @{
        "ca.org1.example.com" = @{
            url = "https://localhost:7054"
            caName = "ca-org1"
            tlsCACerts = @{
                pem = (Get-Content -Path "$PWD/organizations/peerOrganizations/org1.example.com/ca/ca.org1.example.com-cert.pem" -Raw)
            }
            httpOptions = @{
                verify = $false
            }
        }
    }
}

$connectionProfileJson = $connectionProfile | ConvertTo-Json -Depth 10
$connectionProfileJson | Out-File -FilePath "$connectionProfileDir\connection-profile.json"
Write-Host "Created connection profile at $connectionProfileDir\connection-profile.json"

# Export the admin identity to the wallet
$adminIdentityDir = "$walletPath\admin"
if (-not (Test-Path $adminIdentityDir)) {
    New-Item -ItemType Directory -Path $adminIdentityDir | Out-Null
}

# Copy the admin certificate
$adminCert = Get-Content -Path "$PWD/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts/Admin@org1.example.com-cert.pem" -Raw
$adminKeyPath = Get-ChildItem -Path "$PWD/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore" -Filter "*_sk" | Select-Object -First 1 -ExpandProperty FullName
$adminKey = Get-Content -Path $adminKeyPath -Raw

$adminIdentity = @{
    credentials = @{
        certificate = $adminCert
        privateKey = $adminKey
    }
    mspId = "Org1MSP"
    type = "X.509"
}

$adminIdentityJson = $adminIdentity | ConvertTo-Json
$adminIdentityJson | Out-File -FilePath "$adminIdentityDir\admin.json"
Write-Host "Exported admin identity to $adminIdentityDir\admin.json"

# Create a system identity for the application
$systemIdentityDir = "$walletPath\system"
if (-not (Test-Path $systemIdentityDir)) {
    New-Item -ItemType Directory -Path $systemIdentityDir | Out-Null
}

# Copy the admin certificate for system identity (in a real system, you would create a separate identity)
$systemIdentity = @{
    credentials = @{
        certificate = $adminCert
        privateKey = $adminKey
    }
    mspId = "Org1MSP"
    type = "X.509"
}

$systemIdentityJson = $systemIdentity | ConvertTo-Json
$systemIdentityJson | Out-File -FilePath "$systemIdentityDir\system.json"
Write-Host "Created system identity at $systemIdentityDir\system.json"

Write-Host "`nConnection files generated successfully!"
Write-Host "Your e-voting application can now connect to the Hyperledger Fabric network."
