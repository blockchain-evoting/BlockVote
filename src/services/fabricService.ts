import { Gateway, Wallets, Contract } from 'fabric-network';
import path from 'path';
import fs from 'fs';
import { Voter } from './api';

class FabricService {
    private gateway: Gateway | null = null;
    private contract: Contract | null = null;

    async connect(userId: string = 'admin'): Promise<void> {
        try {
            // Create a new gateway instance
            this.gateway = new Gateway();

            // Create a new wallet for managing identities
            const walletPath = path.join(process.cwd(), 'wallet');
            const wallet = await Wallets.newFileSystemWallet(walletPath);

            // Check if user identity exists in wallet
            const identity = await wallet.get(userId);
            if (!identity) {
                throw new Error(`Identity for user ${userId} not found in wallet`);
            }

            // Load the connection profile
            const connectionProfilePath = path.join(process.cwd(), 'connection-profile', 'connection-profile.json');
            const connectionProfile = JSON.parse(fs.readFileSync(connectionProfilePath, 'utf8'));

            // Connect to the gateway using connection profile and user identity
            await this.gateway.connect(connectionProfile, {
                wallet,
                identity: userId,
                discovery: { enabled: true, asLocalhost: true }
            });

            // Get the network channel
            const network = await this.gateway.getNetwork('evoting-channel');

            // Get the contract
            this.contract = network.getContract('evoting-chaincode');
            console.log('Connected to Fabric network successfully');
        } catch (error) {
            console.error('Failed to connect to the Fabric gateway:', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        if (this.gateway) {
            this.gateway.disconnect();
            this.gateway = null;
            this.contract = null;
        }
    }

    // Election Management
    async createElection(electionData: any): Promise<void> {
        if (!this.contract) throw new Error('Not connected to Fabric network');
        await this.contract.submitTransaction('createElection', JSON.stringify(electionData));
    }

    async getElection(electionId: string): Promise<any> {
        if (!this.contract) throw new Error('Not connected to Fabric network');
        const result = await this.contract.evaluateTransaction('getElection', electionId);
        return JSON.parse(result.toString());
    }

    async listElections(): Promise<any[]> {
        if (!this.contract) throw new Error('Not connected to Fabric network');
        const result = await this.contract.evaluateTransaction('listElections');
        return JSON.parse(result.toString());
    }

    // Voting Operations
    async castVote(voteData: any): Promise<void> {
        if (!this.contract) throw new Error('Not connected to Fabric network');
        await this.contract.submitTransaction('castVote', JSON.stringify(voteData));
    }

    async getVoteCount(electionId: string, candidateId: string): Promise<number> {
        if (!this.contract) throw new Error('Not connected to Fabric network');
        const result = await this.contract.evaluateTransaction('getVoteCount', electionId, candidateId);
        return parseInt(result.toString());
    }

    async getElectionResults(electionId: string): Promise<any> {
        if (!this.contract) throw new Error('Not connected to Fabric network');
        const result = await this.contract.evaluateTransaction('getElectionResults', electionId);
        return JSON.parse(result.toString());
    }

    // Voter Management
    async registerVoter(voter: Voter): Promise<void> {
        if (!this.contract) throw new Error('Not connected to Fabric network');
        await this.contract.submitTransaction('registerVoter', JSON.stringify(voter));
    }

    async getVoter(voterId: string): Promise<Voter> {
        if (!this.contract) throw new Error('Not connected to Fabric network');
        const result = await this.contract.evaluateTransaction('getVoter', voterId);
        return JSON.parse(result.toString());
    }

    async updateVoter(voter: Voter): Promise<void> {
        if (!this.contract) throw new Error('Not connected to Fabric network');
        await this.contract.submitTransaction('updateVoter', JSON.stringify(voter));
    }

    async deleteVoter(voterId: string): Promise<void> {
        if (!this.contract) throw new Error('Not connected to Fabric network');
        await this.contract.submitTransaction('deleteVoter', voterId);
    }

    async listVoters(): Promise<Voter[]> {
        if (!this.contract) throw new Error('Not connected to Fabric network');
        const result = await this.contract.evaluateTransaction('listVoters');
        return JSON.parse(result.toString());
    }

    async hasVoted(electionId: string, voterId: string): Promise<boolean> {
        if (!this.contract) throw new Error('Not connected to Fabric network');
        const result = await this.contract.evaluateTransaction('hasVoted', electionId, voterId);
        return result.toString() === 'true';
    }
}

export const fabricService = new FabricService();
