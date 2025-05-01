import { Contract } from 'fabric-contract-api';

export class EVotingContract extends Contract {
    
    // Initialize the ledger with some sample data
    async initLedger(ctx) {
        console.log('Initializing the ledger with sample data');
        
        // No initial data needed
        return { success: true, message: 'Ledger initialized successfully' };
    }
    
    // Register a new voter
    async registerVoter(ctx, studentId, name, department, contact, password) {
        console.log(`Registering voter with ID: ${studentId}`);
        
        // Check if voter already exists
        const voterKey = `voter_${studentId}`;
        const existingVoterBytes = await ctx.stub.getState(voterKey);
        
        if (existingVoterBytes && existingVoterBytes.length > 0) {
            throw new Error(`Voter with ID ${studentId} already exists`);
        }
        
        // Create voter object
        const voter = {
            docType: 'voter',
            studentId,
            name,
            department,
            contact,
            password, // In a real system, this should be hashed before storing
            registered: true,
            hasVoted: false,
            createdAt: new Date().toISOString()
        };
        
        // Store voter in state database
        await ctx.stub.putState(voterKey, Buffer.from(JSON.stringify(voter)));
        
        return { success: true, message: 'Voter registered successfully' };
    }
    
    // Get a specific voter by ID
    async getVoter(ctx, studentId) {
        const voterKey = `voter_${studentId}`;
        const voterBytes = await ctx.stub.getState(voterKey);
        
        if (!voterBytes || voterBytes.length === 0) {
            throw new Error(`Voter with ID ${studentId} does not exist`);
        }
        
        const voter = JSON.parse(voterBytes.toString());
        
        // Remove password before returning
        const { password, ...voterWithoutPassword } = voter;
        
        return voterWithoutPassword;
    }
    
    // Get all voters
    async getAllVoters(ctx) {
        const startKey = 'voter_';
        const endKey = 'voter_\uffff';
        
        const iterator = await ctx.stub.getStateByRange(startKey, endKey);
        const voters = [];
        
        let result = await iterator.next();
        while (!result.done) {
            const voter = JSON.parse(result.value.value.toString('utf8'));
            
            // Remove password before adding to results
            const { password, ...voterWithoutPassword } = voter;
            
            voters.push(voterWithoutPassword);
            result = await iterator.next();
        }
        
        await iterator.close();
        
        return voters;
    }
    
    // Authenticate a voter (login)
    async authenticateVoter(ctx, studentId, password) {
        const voterKey = `voter_${studentId}`;
        const voterBytes = await ctx.stub.getState(voterKey);
        
        if (!voterBytes || voterBytes.length === 0) {
            throw new Error(`Voter with ID ${studentId} does not exist`);
        }
        
        const voter = JSON.parse(voterBytes.toString());
        
        // Check if password matches
        if (voter.password !== password) {
            throw new Error('Invalid credentials');
        }
        
        // Remove password before returning
        const { password: _, ...voterWithoutPassword } = voter;
        
        return voterWithoutPassword;
    }
    
    // Update voter information
    async updateVoter(ctx, studentId, name, department, contact) {
        const voterKey = `voter_${studentId}`;
        const voterBytes = await ctx.stub.getState(voterKey);
        
        if (!voterBytes || voterBytes.length === 0) {
            throw new Error(`Voter with ID ${studentId} does not exist`);
        }
        
        const voter = JSON.parse(voterBytes.toString());
        
        // Update voter information
        voter.name = name;
        voter.department = department;
        voter.contact = contact;
        voter.updatedAt = new Date().toISOString();
        
        // Store updated voter in state database
        await ctx.stub.putState(voterKey, Buffer.from(JSON.stringify(voter)));
        
        return { success: true, message: 'Voter updated successfully' };
    }
    
    // Delete a voter
    async deleteVoter(ctx, studentId) {
        const voterKey = `voter_${studentId}`;
        const voterBytes = await ctx.stub.getState(voterKey);
        
        if (!voterBytes || voterBytes.length === 0) {
            throw new Error(`Voter with ID ${studentId} does not exist`);
        }
        
        await ctx.stub.deleteState(voterKey);
        
        return { success: true, message: 'Voter deleted successfully' };
    }
}

export default EVotingContract;
