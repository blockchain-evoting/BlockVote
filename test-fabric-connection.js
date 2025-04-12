import { Gateway, Wallets } from 'fabric-network';
import fs from 'fs';
import path from 'path';

async function main() {
    try {
        console.log('Starting test connection to Hyperledger Fabric...');
        
        // Create a new file system based wallet for managing identities
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the admin user
        let identity = await wallet.get('admin');
        if (!identity) {
            console.log('Admin identity not found. Creating a new admin identity...');
            
            // Create a sample admin identity
            const adminIdentity = {
                credentials: {
                    certificate: "-----BEGIN CERTIFICATE-----\nMIICKTCCAdCgAwIBAgIRALK4uC8MN63+ZOCrHZaWuhkwCgYIKoZIzj0EAwIwczEL\nMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNhbiBG\ncmFuY2lzY28xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMTE2Nh\nLm9yZzEuZXhhbXBsZS5jb20wHhcNMjAwNzA5MTMzODAwWhcNMzAwNzA3MTMzODAw\nWjBsMQswCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMN\nU2FuIEZyYW5jaXNjbzEPMA0GA1UECxMGY2xpZW50MR8wHQYDVQQDDBZBZG1pbkBv\ncmcxLmV4YW1wbGUuY29tMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEoEGXvXcJ\nLOYiQeYUNGo6K9TJkxQMR3wZGHBQj5rSXUmMqV5+emDZu5oUFBF6vZG4zEXGpzgx\nHUdnrDAhPXYXXaNsMGowDgYDVR0PAQH/BAQDAgeAMAwGA1UdEwEB/wQCMAAwKwYD\nVR0jBCQwIoAgUjtpwKyM6P/AQnkxRwIWdFuAxQl9Gp0qVRYgPIm+w6gwHQYDVR0O\nBBYEFJhKoQdSXRjrA4qBZxFJGcz5tKzSMAoGCCqGSM49BAMCA0cAMEQCIHgA5+xy\n6Jtw8NaRVhYYwFoGKQs72+mjl5t9Z7ZUKKWLAiB+JcXXEK4jrwCnwpHmQQTm+3m0\nFYYyWtSOoG/Eos5+uA==\n-----END CERTIFICATE-----\n",
                    privateKey: "-----BEGIN PRIVATE KEY-----\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgxiyAFyD0Eg1NxjbH\nJQZt8jaVfyVB3KMqQ0Qd4JNLZtWhRANCAASgQZe9dwks5iJB5hQ0ajor1MmTFAxH\nfBkYcFCPmtJdSYypXn56YNm7mhQUEXq9kbjMRcanODEdR2esMCE9dhdd\n-----END PRIVATE KEY-----\n"
                },
                mspId: 'Org1MSP',
                type: 'X.509'
            };

            // Save the admin identity to the wallet
            await wallet.put('admin', adminIdentity);
            console.log('Admin identity created and saved to wallet');
            
            identity = adminIdentity;
        }
        
        console.log('Admin identity found in wallet');
        console.log(JSON.stringify(identity, null, 2));

        // Load the connection profile
        const connectionProfilePath = path.join(process.cwd(), 'connection-profile', 'connection-profile.json');
        console.log(`Loading connection profile from: ${connectionProfilePath}`);
        
        if (!fs.existsSync(connectionProfilePath)) {
            console.error(`Connection profile not found at: ${connectionProfilePath}`);
            return;
        }
        
        const connectionProfileContent = fs.readFileSync(connectionProfilePath, 'utf8');
        console.log(`Connection profile content: ${connectionProfileContent.substring(0, 100)}...`);
        
        const connectionProfile = JSON.parse(connectionProfileContent);
        console.log('Connection profile loaded successfully');

        // Create a new gateway for connecting to the peer node
        console.log('Creating gateway and attempting to connect...');
        const gateway = new Gateway();
        await gateway.connect(connectionProfile, {
            wallet,
            identity: 'admin',
            discovery: { enabled: true, asLocalhost: true }
        });
        console.log('Connected to the gateway successfully');

        // Get the network (channel) our contract is deployed to
        console.log('Attempting to connect to the channel...');
        const network = await gateway.getNetwork('evoting-channel');
        console.log('Connected to the channel: evoting-channel');

        // Get the contract from the network
        console.log('Getting the chaincode contract...');
        const contract = network.getContract('evoting-chaincode');
        console.log('Retrieved the smart contract: evoting-chaincode');

        // Test a simple query - list all voters
        console.log('\n--> Evaluating transaction: listVoters');
        const result = await contract.evaluateTransaction('listVoters');
        console.log(`*** Result: ${result.toString()}`);

        // Disconnect from the gateway
        gateway.disconnect();
        console.log('Disconnected from the gateway');

    } catch (error) {
        console.error(`Failed to connect to the network: ${error}`);
        console.error(error.stack);
        process.exit(1);
    }
}

main().catch(error => {
    console.error(`Failed to run the application: ${error}`);
    console.error(error.stack);
    process.exit(1);
});
