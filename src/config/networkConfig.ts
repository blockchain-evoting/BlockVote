export const networkConfig = {
    // Hyperledger Fabric network configuration
    channelName: 'evoting-channel',
    chaincodeName: 'evoting-chaincode',
    mspID: 'Org1MSP',
    connectionProfile: {
        name: 'evoting-network',
        version: '1.0.0',
        client: {
            organization: 'Org1',
            connection: {
                timeout: {
                    peer: {
                        endorser: '300',
                        eventHub: '300',
                        eventReg: '300'
                    },
                    orderer: '300'
                }
            }
        },
        channels: {
            'evoting-channel': {
                orderers: ['orderer.example.com'],
                peers: {
                    'peer0.org1.example.com': {
                        endorsingPeer: true,
                        chaincodeQuery: true,
                        ledgerQuery: true,
                        eventSource: true
                    }
                }
            }
        },
        organizations: {
            Org1: {
                mspid: 'Org1MSP',
                peers: ['peer0.org1.example.com'],
                certificateAuthorities: ['ca.org1.example.com']
            }
        },
        orderers: {
            'orderer.example.com': {
                url: 'grpcs://localhost:7050',
                tlsCACerts: {
                    path: '../crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem'
                }
            }
        },
        peers: {
            'peer0.org1.example.com': {
                url: 'grpcs://localhost:7051',
                tlsCACerts: {
                    path: '../crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/msp/tlscacerts/tlsca.org1.example.com-cert.pem'
                }
            }
        },
        certificateAuthorities: {
            'ca.org1.example.com': {
                url: 'https://localhost:7054',
                caName: 'ca.org1.example.com',
                tlsCACerts: {
                    path: '../crypto-config/peerOrganizations/org1.example.com/ca/ca.org1.example.com-cert.pem'
                },
                httpOptions: {
                    verify: false
                }
            }
        }
    }
};
