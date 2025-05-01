import { NextApiRequest, NextApiResponse } from 'next';
import { Gateway, Wallets } from 'fabric-network';
import * as path from 'path';
import * as fs from 'fs';

async function connectToFabric() {
    try {
        const gateway = new Gateway();
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        const identity = await wallet.get('admin');
        if (!identity) {
            throw new Error('Admin identity not found in wallet');
        }

        const connectionProfilePath = path.join(process.cwd(), 'connection-profile', 'connection-profile.json');
        const connectionProfile = JSON.parse(fs.readFileSync(connectionProfilePath, 'utf8'));

        await gateway.connect(connectionProfile, {
            wallet,
            identity: 'admin',
            discovery: { enabled: true, asLocalhost: true }
        });

        const network = await gateway.getNetwork('evotingchannel');
        const contract = network.getContract('evoting');

        return { gateway, contract };
    } catch (error) {
        console.error('Failed to connect to Fabric:', error);
        throw error;
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const { contract } = await connectToFabric();
            const result = await contract.evaluateTransaction('getAllVoters');
            const voters = JSON.parse(result.toString());
            res.status(200).json(voters);
        } catch (error) {
            console.error('Error getting voters:', error);
            res.status(500).json({ error: 'Failed to get voters' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
