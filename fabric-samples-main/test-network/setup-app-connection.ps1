# Set environment variables for Fabric
$env:FABRIC_CFG_PATH = "$PWD\..\config"
$env:PATH += ";$PWD\..\bin"

# Create directories
$appRoot = "D:\PROJECTS\Apps\E-VOTING SYSTEM\E-voting"
$walletPath = "$appRoot\wallet"
$connectionProfileDir = "$appRoot\connection-profile"

# Create wallet directory
if (-not (Test-Path $walletPath)) {
    New-Item -ItemType Directory -Path $walletPath | Out-Null
    Write-Host "Created wallet directory at $walletPath"
}

# Create connection profile directory
if (-not (Test-Path $connectionProfileDir)) {
    New-Item -ItemType Directory -Path $connectionProfileDir | Out-Null
    Write-Host "Created connection profile directory at $connectionProfileDir"
}

# Get certificate paths
$ordererCertPath = "$PWD/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt"
$peerCertPath = "$PWD/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"
$caCertPath = "$PWD/organizations/peerOrganizations/org1.example.com/ca/ca.org1.example.com-cert.pem"
$adminCertPath = "$PWD/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts/Admin@org1.example.com-cert.pem"

# Read certificates
$ordererCert = Get-Content -Path $ordererCertPath -Raw
$peerCert = Get-Content -Path $peerCertPath -Raw
$caCert = Get-Content -Path $caCertPath -Raw
$adminCert = Get-Content -Path $adminCertPath -Raw

# Find admin private key
$adminKeyDir = "$PWD/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore"
$adminKeyFile = Get-ChildItem -Path $adminKeyDir | Select-Object -First 1 -ExpandProperty FullName
$adminKey = Get-Content -Path $adminKeyFile -Raw

# Create connection profile JSON
$connectionProfileJson = @"
{
  "name": "evoting-network",
  "version": "1.0.0",
  "client": {
    "organization": "Org1",
    "connection": {
      "timeout": {
        "peer": {
          "endorser": "300",
          "eventHub": "300",
          "eventReg": "300"
        },
        "orderer": "300"
      }
    }
  },
  "channels": {
    "evoting-channel": {
      "orderers": [
        "orderer.example.com"
      ],
      "peers": {
        "peer0.org1.example.com": {
          "endorsingPeer": true,
          "chaincodeQuery": true,
          "ledgerQuery": true,
          "eventSource": true
        }
      }
    }
  },
  "organizations": {
    "Org1": {
      "mspid": "Org1MSP",
      "peers": [
        "peer0.org1.example.com"
      ],
      "certificateAuthorities": [
        "ca.org1.example.com"
      ]
    }
  },
  "orderers": {
    "orderer.example.com": {
      "url": "grpcs://localhost:7050",
      "tlsCACerts": {
        "pem": "$ordererCert"
      },
      "grpcOptions": {
        "ssl-target-name-override": "orderer.example.com",
        "hostnameOverride": "orderer.example.com"
      }
    }
  },
  "peers": {
    "peer0.org1.example.com": {
      "url": "grpcs://localhost:7051",
      "tlsCACerts": {
        "pem": "$peerCert"
      },
      "grpcOptions": {
        "ssl-target-name-override": "peer0.org1.example.com",
        "hostnameOverride": "peer0.org1.example.com"
      }
    }
  },
  "certificateAuthorities": {
    "ca.org1.example.com": {
      "url": "https://localhost:7054",
      "caName": "ca-org1",
      "tlsCACerts": {
        "pem": "$caCert"
      },
      "httpOptions": {
        "verify": false
      }
    }
  }
}
"@

# Save connection profile
$connectionProfileJson | Out-File -FilePath "$connectionProfileDir\connection-profile.json"
Write-Host "Created connection profile at $connectionProfileDir\connection-profile.json"

# Create admin identity JSON
$adminIdentityDir = "$walletPath\admin"
if (-not (Test-Path $adminIdentityDir)) {
    New-Item -ItemType Directory -Path $adminIdentityDir | Out-Null
}

$adminIdentityJson = @"
{
  "credentials": {
    "certificate": "$adminCert",
    "privateKey": "$adminKey"
  },
  "mspId": "Org1MSP",
  "type": "X.509"
}
"@

$adminIdentityJson | Out-File -FilePath "$adminIdentityDir\admin.json"
Write-Host "Exported admin identity to $adminIdentityDir\admin.json"

# Create system identity
$systemIdentityDir = "$walletPath\system"
if (-not (Test-Path $systemIdentityDir)) {
    New-Item -ItemType Directory -Path $systemIdentityDir | Out-Null
}

$systemIdentityJson = @"
{
  "credentials": {
    "certificate": "$adminCert",
    "privateKey": "$adminKey"
  },
  "mspId": "Org1MSP",
  "type": "X.509"
}
"@

$systemIdentityJson | Out-File -FilePath "$systemIdentityDir\system.json"
Write-Host "Created system identity at $systemIdentityDir\system.json"

Write-Host "`nConnection files generated successfully!"
Write-Host "Your e-voting application can now connect to the Hyperledger Fabric network."
