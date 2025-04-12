import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';

// Define interfaces for our data models
interface Voter {
    id: string;
    studentId: string;
    name: string;
    department: string;
    contact: string;
    password?: string;
}

interface Candidate {
    id: string;
    name: string;
    party: string;
    position: string;
    department: string;
    year: string;
    voteCount: number;
}

interface Election {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    totalVoters: number;
    totalVotes: number;
    status: 'upcoming' | 'active' | 'ended';
    candidates: Candidate[];
}

interface Vote {
    electionId: string;
    candidateId: string;
    voterId: string;
    timestamp: string;
}

@Info({ title: 'EVotingContract', description: 'Smart contract for e-voting system' })
export class EVotingContract extends Contract {

    // Initialize the ledger with some default data
    @Transaction()
    public async initLedger(ctx: Context): Promise<void> {
        console.info('============= START : Initialize Ledger ===========');
        console.info('============= END : Initialize Ledger ===========');
    }

    // Voter Management Functions
    @Transaction()
    public async registerVoter(ctx: Context, voterJSON: string): Promise<void> {
        const voter: Voter = JSON.parse(voterJSON);
        await ctx.stub.putState(`VOTER_${voter.id}`, Buffer.from(JSON.stringify(voter)));
    }

    @Transaction(false)
    @Returns('string')
    public async getVoter(ctx: Context, voterId: string): Promise<string> {
        const voterAsBytes = await ctx.stub.getState(`VOTER_${voterId}`);
        if (!voterAsBytes || voterAsBytes.length === 0) {
            throw new Error(`Voter with ID ${voterId} does not exist`);
        }
        return voterAsBytes.toString();
    }

    @Transaction()
    public async updateVoter(ctx: Context, voterJSON: string): Promise<void> {
        const voter: Voter = JSON.parse(voterJSON);
        const exists = await this.voterExists(ctx, voter.id);
        if (!exists) {
            throw new Error(`Voter with ID ${voter.id} does not exist`);
        }
        await ctx.stub.putState(`VOTER_${voter.id}`, Buffer.from(JSON.stringify(voter)));
    }

    @Transaction()
    public async deleteVoter(ctx: Context, voterId: string): Promise<void> {
        const exists = await this.voterExists(ctx, voterId);
        if (!exists) {
            throw new Error(`Voter with ID ${voterId} does not exist`);
        }
        await ctx.stub.deleteState(`VOTER_${voterId}`);
    }

    @Transaction(false)
    @Returns('boolean')
    public async voterExists(ctx: Context, voterId: string): Promise<boolean> {
        const voterAsBytes = await ctx.stub.getState(`VOTER_${voterId}`);
        return voterAsBytes && voterAsBytes.length > 0;
    }

    @Transaction(false)
    @Returns('string')
    public async listVoters(ctx: Context): Promise<string> {
        const startKey = 'VOTER_';
        const endKey = 'VOTER_~';
        const iterator = await ctx.stub.getStateByRange(startKey, endKey);

        const voters = [];
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            voters.push(JSON.parse(strValue));
            result = await iterator.next();
        }
        await iterator.close();
        return JSON.stringify(voters);
    }

    // Election Management Functions
    @Transaction()
    public async createElection(ctx: Context, electionJSON: string): Promise<void> {
        const election: Election = JSON.parse(electionJSON);
        await ctx.stub.putState(`ELECTION_${election.id}`, Buffer.from(JSON.stringify(election)));
    }

    @Transaction(false)
    @Returns('string')
    public async getElection(ctx: Context, electionId: string): Promise<string> {
        const electionAsBytes = await ctx.stub.getState(`ELECTION_${electionId}`);
        if (!electionAsBytes || electionAsBytes.length === 0) {
            throw new Error(`Election with ID ${electionId} does not exist`);
        }
        return electionAsBytes.toString();
    }

    @Transaction()
    public async updateElection(ctx: Context, electionJSON: string): Promise<void> {
        const election: Election = JSON.parse(electionJSON);
        const exists = await this.electionExists(ctx, election.id);
        if (!exists) {
            throw new Error(`Election with ID ${election.id} does not exist`);
        }
        await ctx.stub.putState(`ELECTION_${election.id}`, Buffer.from(JSON.stringify(election)));
    }

    @Transaction(false)
    @Returns('boolean')
    public async electionExists(ctx: Context, electionId: string): Promise<boolean> {
        const electionAsBytes = await ctx.stub.getState(`ELECTION_${electionId}`);
        return electionAsBytes && electionAsBytes.length > 0;
    }

    @Transaction(false)
    @Returns('string')
    public async listElections(ctx: Context): Promise<string> {
        const startKey = 'ELECTION_';
        const endKey = 'ELECTION_~';
        const iterator = await ctx.stub.getStateByRange(startKey, endKey);

        const elections = [];
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            elections.push(JSON.parse(strValue));
            result = await iterator.next();
        }
        await iterator.close();
        return JSON.stringify(elections);
    }

    // Voting Functions
    @Transaction()
    public async castVote(ctx: Context, voteJSON: string): Promise<void> {
        const vote: Vote = JSON.parse(voteJSON);
        
        // Check if voter exists
        const voterExists = await this.voterExists(ctx, vote.voterId);
        if (!voterExists) {
            throw new Error(`Voter with ID ${vote.voterId} does not exist`);
        }
        
        // Check if election exists
        const electionAsBytes = await ctx.stub.getState(`ELECTION_${vote.electionId}`);
        if (!electionAsBytes || electionAsBytes.length === 0) {
            throw new Error(`Election with ID ${vote.electionId} does not exist`);
        }
        
        // Check if voter has already voted in this election
        const hasVoted = await this.hasVoted(ctx, vote.electionId, vote.voterId);
        if (hasVoted) {
            throw new Error(`Voter ${vote.voterId} has already voted in election ${vote.electionId}`);
        }
        
        // Store the vote
        const voteKey = `VOTE_${vote.electionId}_${vote.voterId}`;
        await ctx.stub.putState(voteKey, Buffer.from(JSON.stringify(vote)));
        
        // Update election vote count
        const election: Election = JSON.parse(electionAsBytes.toString());
        election.totalVotes += 1;
        
        // Update candidate vote count
        for (let i = 0; i < election.candidates.length; i++) {
            if (election.candidates[i].id === vote.candidateId) {
                election.candidates[i].voteCount += 1;
                break;
            }
        }
        
        await ctx.stub.putState(`ELECTION_${vote.electionId}`, Buffer.from(JSON.stringify(election)));
    }

    @Transaction(false)
    @Returns('boolean')
    public async hasVoted(ctx: Context, electionId: string, voterId: string): Promise<boolean> {
        const voteKey = `VOTE_${electionId}_${voterId}`;
        const voteAsBytes = await ctx.stub.getState(voteKey);
        return voteAsBytes && voteAsBytes.length > 0;
    }

    @Transaction(false)
    @Returns('number')
    public async getVoteCount(ctx: Context, electionId: string, candidateId: string): Promise<number> {
        const electionAsBytes = await ctx.stub.getState(`ELECTION_${electionId}`);
        if (!electionAsBytes || electionAsBytes.length === 0) {
            throw new Error(`Election with ID ${electionId} does not exist`);
        }
        
        const election: Election = JSON.parse(electionAsBytes.toString());
        for (const candidate of election.candidates) {
            if (candidate.id === candidateId) {
                return candidate.voteCount;
            }
        }
        
        throw new Error(`Candidate with ID ${candidateId} does not exist in election ${electionId}`);
    }

    @Transaction(false)
    @Returns('string')
    public async getElectionResults(ctx: Context, electionId: string): Promise<string> {
        const electionAsBytes = await ctx.stub.getState(`ELECTION_${electionId}`);
        if (!electionAsBytes || electionAsBytes.length === 0) {
            throw new Error(`Election with ID ${electionId} does not exist`);
        }
        
        const election: Election = JSON.parse(electionAsBytes.toString());
        return JSON.stringify(election.candidates);
    }
}

export default EVotingContract;
