# Set environment variables for Fabric
$env:FABRIC_CFG_PATH = "$PWD\..\config"
$env:PATH += ";$PWD\..\bin"

# Set environment variables for Org1's peer
$env:CORE_PEER_TLS_ENABLED = "true"
$env:CORE_PEER_LOCALMSPID = "Org1MSP"
$env:CORE_PEER_TLS_ROOTCERT_FILE = "$PWD/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"
$env:CORE_PEER_MSPCONFIGPATH = "$PWD/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp"
$env:CORE_PEER_ADDRESS = "localhost:7051"

# Initialize the ledger
Write-Host "Initializing the ledger..."
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "$PWD/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C evoting-channel -n evoting-chaincode --peerAddresses localhost:7051 --tlsRootCertFiles "$PWD/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "$PWD/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" -c '{"function":"initLedger","Args":[]}'

# Wait for transaction to be committed
Start-Sleep -Seconds 5

# Register a test voter
Write-Host "`nRegistering a test voter..."
$testVoter = @{
    id = "voter1"
    studentId = "S12345"
    name = "John Doe"
    department = "Computer Science"
    contact = "1234567890"
    password = "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8" # hash of 'password'
} | ConvertTo-Json -Compress

peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "$PWD/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C evoting-channel -n evoting-chaincode --peerAddresses localhost:7051 --tlsRootCertFiles "$PWD/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "$PWD/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" -c "{`"function`":`"registerVoter`",`"Args`":[`"$testVoter`"]}"

# Wait for transaction to be committed
Start-Sleep -Seconds 5

# Create a test election
Write-Host "`nCreating a test election..."
$testElection = @{
    id = "election1"
    title = "Student Council Election 2025"
    startDate = "2025-04-10T00:00:00Z"
    endDate = "2025-04-15T23:59:59Z"
    totalVoters = 0
    totalVotes = 0
    status = "upcoming"
    candidates = @(
        @{
            id = "candidate1"
            name = "Alice Smith"
            party = "Progressive Party"
            position = "President"
            department = "Computer Science"
            year = "3rd"
            voteCount = 0
        },
        @{
            id = "candidate2"
            name = "Bob Johnson"
            party = "Innovation Party"
            position = "President"
            department = "Electrical Engineering"
            year = "4th"
            voteCount = 0
        }
    )
} | ConvertTo-Json -Compress

peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "$PWD/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C evoting-channel -n evoting-chaincode --peerAddresses localhost:7051 --tlsRootCertFiles "$PWD/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "$PWD/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" -c "{`"function`":`"createElection`",`"Args`":[`"$testElection`"]}"

# Wait for transaction to be committed
Start-Sleep -Seconds 5

# List all elections
Write-Host "`nListing all elections..."
peer chaincode query -C evoting-channel -n evoting-chaincode -c '{"function":"listElections","Args":[]}'

# List all voters
Write-Host "`nListing all voters..."
peer chaincode query -C evoting-channel -n evoting-chaincode -c '{"function":"listVoters","Args":[]}'

Write-Host "`nE-Voting System Chaincode Test Complete!"
