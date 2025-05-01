import { Gateway, Wallets } from 'fabric-network';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

// Simple password hashing function
const hashPassword = (password: string): string => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

async function main() {
    try {
        // Create a new gateway instance
        const gateway = new Gateway();
        
        // Create a new wallet for managing identities
        const walletPath = path.join(process.cwd(), '..', 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // Load connection profile
        const connectionProfilePath = path.join(process.cwd(), '..', 'connection-profile', 'connection-profile.json');
        const connectionProfile = JSON.parse(fs.readFileSync(connectionProfilePath, 'utf8'));

        // Connect to gateway
        await gateway.connect(connectionProfile, {
            wallet,
            identity: 'admin',
            discovery: { enabled: true, asLocalhost: true }
        });

        // Get the network and contract
        const network = await gateway.getNetwork('evotingchannel');
        const contract = network.getContract('evoting');

        // Admin details
        const adminId = 'admin123';
        const name = 'System Admin';
        const department = 'IT Department';
        const contact = '9876543210';
        const password = 'admin123'; // In a real system, use a strong password
        const hashedPassword = hashPassword(password);

        // Create admin in the blockchain
        await contract.submitTransaction(
            'registerVoter', 
            adminId, 
            name, 
            department, 
            contact, 
            hashedPassword
        );

        console.log('Admin user created successfully');
        console.log('Admin ID:', adminId);
        console.log('Password:', password);

        // Disconnect from gateway
        await gateway.disconnect();

    } catch (error) {
        console.error('Failed to create admin user:', error);
        process.exit(1);
    }
}

main();
