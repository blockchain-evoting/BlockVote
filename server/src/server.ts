import express from 'express';
import cors from 'cors';
import { Gateway, Wallets } from 'fabric-network';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables if .env file exists
try {
    require('dotenv').config();
} catch (error) {
    console.log('No .env file found, using default configuration');
}

// Configuration
const app = express();
const port = process.env.API_PORT || process.env.PORT || 3000;
const MOCK_MODE = process.env.MOCK_MODE === 'true' || false;

// Define interfaces for simulation data store
interface SimVoter {
    id: string;
    studentId: string;
    name: string;
    department: string;
    contact: string;
    password: string;
    registeredBy?: string;
    registeredAt?: string;
}

interface SimElection {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    totalVoters: number;
    totalVotes: number;
    status: string;
    candidates: any[];
}

interface SimVote {
    electionId: string;
    candidateId: string;
    voterId: string;
    timestamp: string;
}

interface SimulationStore {
    voters: SimVoter[];
    elections: SimElection[];
    votes: SimVote[];
}

// File path for simulation data persistence
const SIM_DATA_FILE = path.join(__dirname, '..', 'simulation-data.json');

// Load simulation data from file if it exists
function loadSimulationData(): SimulationStore {
    try {
        if (fs.existsSync(SIM_DATA_FILE)) {
            const data = fs.readFileSync(SIM_DATA_FILE, 'utf8');
            console.log('Loading simulation data from storage');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading simulation data:', error);
    }
    return {
        voters: [],
        elections: [],
        votes: []
    };
}

// Save simulation data to file
function saveSimulationData() {
    try {
        fs.writeFileSync(SIM_DATA_FILE, JSON.stringify(dataStore, null, 2));
        console.log('Simulation data saved to storage');
    } catch (error) {
        console.error('Error saving simulation data:', error);
    }
}

// In-memory store for simulation mode with persistence
const dataStore: SimulationStore = loadSimulationData();

console.log(`Starting server with simulation mode: ${MOCK_MODE}`);

// Add a sample voter if the store is empty
if (MOCK_MODE && dataStore.voters.length === 0) {
    console.log('Adding a sample voter to the database');
    dataStore.voters.push({
        id: 'voter_test123',
        studentId: 'TEST123',
        name: 'Test User',
        department: 'Computer Science',
        contact: '1234567890',
        password: 'ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f', // hash of 'password'
        registeredBy: 'system',
        registeredAt: new Date().toISOString()
    });
    saveSimulationData();
}


// Utility function to check port availability and find an available port
const net = require('net');

function isPortAvailable(port: number): Promise<boolean> {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.once('error', () => resolve(false));
        server.once('listening', () => {
            server.close();
            resolve(true);
        });
        server.listen(port);
    });
}

async function findAvailablePort(startPort: number): Promise<number> {
    let port = startPort;
    while (!(await isPortAvailable(port))) {
        console.log(`Port ${port} is in use, trying next port...`);
        port++;
        if (port > startPort + 100) {
            // Prevent infinite loop, limit to 100 port attempts
            console.error(`Could not find an available port after 100 attempts starting from ${startPort}`);
            throw new Error('No available ports found');
        }
    }
    return port;
}

// Log server configuration on startup
console.log(`Server starting with configuration:`);
console.log(`- Requested Port: ${port}`);
console.log(`- Environment: ${process.env.NODE_ENV || 'development'}`);


// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5177', 'http://localhost:3000'], // Allow frontend origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'BlockVote API Server' });
});

// Define interface for health status response
interface BlockchainStatus {
    status: string;
    network: string;
    chaincode: string;
    error?: string;
}

interface HealthStatus {
    server: {
        status: string;
        timestamp: string;
        port: string | number;
    };
    blockchain: BlockchainStatus;
}

// Health check endpoint
app.get('/api/health', async (req, res) => {
    const healthStatus: HealthStatus = {
        server: {
            status: 'ok',
            timestamp: new Date().toISOString(),
            port: process.env.API_PORT || port
        },
        blockchain: {
            status: 'unknown',
            network: 'evotingchannel',
            chaincode: 'evoting'
        }
    };
    
    // Check blockchain connection
    try {
        const { contract } = await connectToFabric();
        // Try a simple query to verify connection
        await contract.evaluateTransaction('getAllVoters');
        healthStatus.blockchain.status = 'connected';
    } catch (error: any) { // Type assertion for error
        healthStatus.blockchain.status = 'disconnected';
        healthStatus.blockchain.error = error?.message || 'Unknown error';
    }
    
    const httpStatus = healthStatus.blockchain.status === 'connected' ? 200 : 503;
    res.status(httpStatus).json(healthStatus);
});

// Fabric connection setup with retry logic
async function connectToFabric(retries = 3, retryDelay = 2000) {
    let lastError;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`Attempt ${attempt}/${retries} to connect to Fabric network...`);
            
            // Create a new gateway instance
            const gateway = new Gateway();
            
            // Create a new wallet for managing identities
            // Use absolute path to ensure we find the wallet directory
            const projectRoot = path.resolve(process.cwd(), '..');
            const walletPath = path.join(projectRoot, 'wallet');
            console.log(`Using wallet at: ${walletPath}`);
            
            // Check if wallet directory exists
            if (!fs.existsSync(walletPath)) {
                throw new Error(`Wallet directory not found at ${walletPath}`);
            }
            
            const wallet = await Wallets.newFileSystemWallet(walletPath);
            
            // Check if admin identity exists in wallet
            const adminIdentity = await wallet.get('admin');
            if (!adminIdentity) {
                throw new Error('Admin identity not found in wallet. Please check your network setup.');
            }

            // Load connection profile
            const connectionProfilePath = path.join(projectRoot, 'connection-profile', 'connection-profile.json');
            console.log(`Using connection profile at: ${connectionProfilePath}`);
            
            if (!fs.existsSync(connectionProfilePath)) {
                throw new Error(`Connection profile not found at ${connectionProfilePath}`);
            }
            
            const connectionProfile = JSON.parse(fs.readFileSync(connectionProfilePath, 'utf8'));

            // Connect to gateway with timeout
            await gateway.connect(connectionProfile, {
                wallet,
                identity: 'admin',
                discovery: { enabled: true, asLocalhost: true },
                eventHandlerOptions: {
                    commitTimeout: 30, // seconds
                    endorseTimeout: 30  // seconds
                }
            });

            // Get the network and contract
            const network = await gateway.getNetwork('evotingchannel');
            const contract = network.getContract('evoting');
            
            console.log('Successfully connected to Fabric network!');
            return { gateway, contract };
        } catch (error: any) {
            console.error(`Attempt ${attempt}/${retries} failed:`, error.message);
            lastError = error;
            
            // If we have more retries, wait before the next attempt
            if (attempt < retries) {
                console.log(`Waiting ${retryDelay}ms before next attempt...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                // Increase delay for next retry (exponential backoff)
                retryDelay *= 1.5;
            }
        }
    }
    
    console.error('All connection attempts to Fabric network failed');
    throw lastError || new Error('Failed to connect to Fabric network after multiple attempts');
}

// API Routes
app.get('/api/voters', async (req, res) => {
    try {
        // Check if we're in simulation mode
        if (MOCK_MODE) {
            console.log('Returning voters from simulation database');
            // Return voters from simulation store with redacted passwords
            const safeVoters = dataStore.voters.map((voter: SimVoter) => {
                const { password, ...voterWithoutPassword } = voter;
                return { ...voterWithoutPassword, password: '[REDACTED]' };
            });
            return res.json(safeVoters);
        }
        
        // Real blockchain mode
        const { contract } = await connectToFabric();
        const result = await contract.evaluateTransaction('getAllVoters');
        const voters = JSON.parse(result.toString());
        res.json(voters);
    } catch (error) {
        console.error('Error getting voters:', error);
        res.status(500).json({ error: 'Failed to get voters' });
    }
});

// Get voter by student ID
app.get('/api/voters/student/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const adminId = req.query.adminId as string;
        
        // Validate required parameters
        if (!studentId) {
            return res.status(400).json({ error: 'Student ID is required' });
        }
        
        console.log(`Getting voter with student ID: ${studentId}`);
        
        // Check if we're in simulation mode
        if (MOCK_MODE) {
            console.log('Retrieving voter from simulation database');
            
            // Find voter in simulation store
            const voter = dataStore.voters.find((v: SimVoter) => v.studentId === studentId);
            
            if (!voter) {
                return res.status(404).json({ error: 'Voter not found' });
            }
            
            return res.json(voter);
        }
        
        // Real blockchain mode
        const { contract } = await connectToFabric();
        const result = await contract.evaluateTransaction('getVoterByStudentId', studentId);
        
        if (!result || result.length === 0) {
            return res.status(404).json({ error: 'Voter not found' });
        }
        
        const voter = JSON.parse(result.toString());
        res.json(voter);
    } catch (error) {
        console.error('Error getting voter by student ID:', error);
        res.status(500).json({ error: 'Failed to get voter' });
    }
});

app.post('/api/voters/register', async (req, res) => {
    try {
        console.log('Received voter registration request:', JSON.stringify(req.body, null, 2));
        
        // Extract voter data from request body
        let studentId, name, department, contact, password, adminId;
        
        if (req.body.voter) {
            // Data is in the format { adminId, voter: { ... } }
            adminId = req.body.adminId;
            const { voter } = req.body;
            studentId = voter.studentId;
            name = voter.name;
            department = voter.department;
            contact = voter.contact;
            password = voter.password;
        } else {
            // Data is in the format { studentId, name, ... }
            ({ studentId, name, department, contact, password } = req.body);
        }
        
        // Validate required fields
        if (!studentId || !name || !department || !contact || !password) {
            console.error('Missing required fields for voter registration');
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if we're in simulation mode
        if (MOCK_MODE) {
            console.log('Registering voter in simulation database');
            
            // Check if voter already exists
            const existingVoter = dataStore.voters.find((v: SimVoter) => v.studentId === studentId);
            if (existingVoter) {
                return res.status(400).json({ 
                    error: 'Voter already exists', 
                    details: `A voter with student ID ${studentId} already exists`
                });
            }
            
            // Add voter to simulation database
            const newVoter: SimVoter = {
                id: `voter_${Date.now()}`,
                studentId,
                name,
                department,
                contact,
                password, // In a real app, we would hash this
                registeredBy: adminId || 'system',
                registeredAt: new Date().toISOString()
            };
            
            dataStore.voters.push(newVoter);
            
            // Save the updated simulation data to storage
            saveSimulationData();
            
            console.log(`Voter registered successfully: ${newVoter.id}`);
            return res.json({ 
                message: 'Voter registered successfully', 
                simulationMode: true,
                voter: { ...newVoter, password: '[REDACTED]' }
            });
        }
        
        // Real blockchain mode
        try {
            // Try to connect to the blockchain network
            const fabricConnection = await connectToFabric();
            const contract = fabricConnection.contract;
            
            console.log(`Registering voter with ID: ${studentId} on blockchain`);
            await contract.submitTransaction('registerVoter', studentId, name, department, contact, password);
            res.json({ message: 'Voter registered successfully' });
        } catch (fabricError) {
            console.error('Blockchain error:', fabricError);
            
            // If blockchain is unavailable but we're not in mock mode, suggest enabling it
            return res.status(503).json({ 
                error: 'Blockchain network unavailable', 
                details: 'Cannot connect to the blockchain network. Please ensure the network is running or enable mock mode for development.',
                suggestion: 'To enable mock mode, set MOCK_MODE=true in your environment variables.'
            });
        }
    } catch (error: any) {
        console.error('Error registering voter:', error);
        res.status(500).json({ error: 'Failed to register voter', details: error?.message || 'Unknown error' });
    }
});

// Update voter endpoint
app.put('/api/voters/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { adminId, ...updatedVoter } = req.body;
        
        // Check if we're in simulation mode
        if (MOCK_MODE) {
            console.log(`Updating voter with ID: ${id} by admin: ${adminId}`);
            
            // Find the voter in the simulation database
            const voterIndex = dataStore.voters.findIndex((v: SimVoter) => v.id === id || v.studentId === id);
            
            if (voterIndex === -1) {
                return res.status(400).json({
                    error: 'Voter not found',
                    details: `No voter found with ID ${id}`
                });
            }
            
            // Update the voter (preserving the ID and password)
            const existingVoter = dataStore.voters[voterIndex];
            dataStore.voters[voterIndex] = {
                ...existingVoter,
                ...updatedVoter,
                id: existingVoter.id, // Ensure ID doesn't change
                password: existingVoter.password // Preserve password
            };
            
            // Save the updated simulation data
            saveSimulationData();
            
            console.log(`Voter updated successfully: ${existingVoter.id}`);
            return res.json({
                message: 'Voter updated successfully',
                simulationMode: true,
                voter: { ...dataStore.voters[voterIndex], password: '[REDACTED]' }
            });
        }
        
        // Real blockchain mode
        const { contract } = await connectToFabric();
        await contract.submitTransaction('updateVoter', JSON.stringify(updatedVoter));
        res.json({ message: 'Voter updated successfully' });
    } catch (error) {
        console.error('Error updating voter:', error);
        res.status(500).json({ error: 'Failed to update voter' });
    }
});

// Delete voter endpoint
app.delete('/api/voters/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.query.adminId as string;
        
        // Check if we're in simulation mode
        if (MOCK_MODE) {
            console.log(`Deleting voter with ID: ${id} by admin: ${adminId}`);
            
            // Find the voter in the simulation database
            const voterIndex = dataStore.voters.findIndex((v: SimVoter) => v.id === id || v.studentId === id);
            
            if (voterIndex === -1) {
                return res.status(404).json({
                    error: 'Voter not found',
                    details: `No voter found with ID ${id}`
                });
            }
            
            // Remove the voter
            const deletedVoter = dataStore.voters.splice(voterIndex, 1)[0];
            
            // Save the updated simulation data
            saveSimulationData();
            
            console.log(`Voter deleted successfully: ${deletedVoter.id}`);
            return res.json({
                message: 'Voter deleted successfully',
                simulationMode: true,
                voter: { ...deletedVoter, password: '[REDACTED]' }
            });
        }
        
        // Real blockchain mode
        const { contract } = await connectToFabric();
        await contract.submitTransaction('deleteVoter', id);
        res.json({ message: 'Voter deleted successfully' });
    } catch (error) {
        console.error('Error deleting voter:', error);
        res.status(500).json({ error: 'Failed to delete voter' });
    }
});

// Election Management Endpoints

// List all elections
app.get('/api/elections', async (req, res) => {
    try {
        // Check if we're in simulation mode
        if (MOCK_MODE) {
            console.log('Returning elections from simulation database');
            return res.json(dataStore.elections);
        }
        
        // Real blockchain mode
        const { contract } = await connectToFabric();
        const result = await contract.evaluateTransaction('queryAllElections');
        const elections = JSON.parse(result.toString());
        res.json(elections);
    } catch (error) {
        console.error('Error listing elections:', error);
        res.status(500).json({ error: 'Failed to list elections' });
    }
});

// Get current active election
app.get('/api/elections/current', async (req, res) => {
    try {
        // Check if we're in simulation mode
        if (MOCK_MODE) {
            console.log('Returning current election from simulation database');
            const now = new Date().toISOString();
            const currentElection = dataStore.elections.find((election: SimElection) => {
                return election.startDate <= now && election.endDate >= now && election.status === 'active';
            });
            
            if (!currentElection) {
                return res.status(404).json({ error: 'No active election found' });
            }
            
            return res.json(currentElection);
        }
        
        // Real blockchain mode
        const { contract } = await connectToFabric();
        const result = await contract.evaluateTransaction('getCurrentElection');
        const election = JSON.parse(result.toString());
        res.json(election);
    } catch (error) {
        console.error('Error getting current election:', error);
        res.status(500).json({ error: 'Failed to get current election' });
    }
});

// Create a new election
app.post('/api/elections', async (req, res) => {
    try {
        const { adminId, election } = req.body;
        
        if (!election.title || !election.startDate || !election.endDate || !election.candidates || election.candidates.length === 0) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Check if we're in simulation mode
        if (MOCK_MODE) {
            console.log(`Creating new election by admin: ${adminId}`);
            
            const newElection: SimElection = {
                id: `election_${Date.now()}`,
                title: election.title,
                startDate: election.startDate,
                endDate: election.endDate,
                totalVoters: 0,
                totalVotes: 0,
                status: new Date(election.startDate) <= new Date() && new Date(election.endDate) >= new Date() ? 'active' : 
                         new Date(election.startDate) > new Date() ? 'upcoming' : 'ended',
                candidates: election.candidates.map((candidate: any, index: number) => ({
                    id: `candidate_${Date.now()}_${index}`,
                    ...candidate,
                    voteCount: 0
                }))
            };
            
            dataStore.elections.push(newElection);
            saveSimulationData();
            
            console.log(`Election created successfully: ${newElection.id}`);
            return res.json({
                message: 'Election created successfully',
                simulationMode: true,
                election: newElection
            });
        }
        
        // Real blockchain mode
        const { contract } = await connectToFabric();
        await contract.submitTransaction('createElection', JSON.stringify(election));
        res.json({ message: 'Election created successfully' });
    } catch (error) {
        console.error('Error creating election:', error);
        res.status(500).json({ error: 'Failed to create election' });
    }
});

// Update an existing election
app.put('/api/elections/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { adminId, ...updatedElection } = req.body;
        
        // Check if we're in simulation mode
        if (MOCK_MODE) {
            console.log(`Updating election with ID: ${id} by admin: ${adminId}`);
            
            // Find the election in the simulation database
            const electionIndex = dataStore.elections.findIndex((e: SimElection) => e.id === id);
            
            if (electionIndex === -1) {
                return res.status(404).json({
                    error: 'Election not found',
                    details: `No election found with ID ${id}`
                });
            }
            
            // Update the election (preserving the ID)
            const existingElection = dataStore.elections[electionIndex];
            dataStore.elections[electionIndex] = {
                ...existingElection,
                ...updatedElection,
                id: existingElection.id, // Ensure ID doesn't change
                status: new Date(updatedElection.startDate || existingElection.startDate) <= new Date() && 
                         new Date(updatedElection.endDate || existingElection.endDate) >= new Date() ? 'active' : 
                         new Date(updatedElection.startDate || existingElection.startDate) > new Date() ? 'upcoming' : 'ended',
            };
            
            // Save the updated simulation data
            saveSimulationData();
            
            console.log(`Election updated successfully: ${existingElection.id}`);
            return res.json({
                message: 'Election updated successfully',
                simulationMode: true,
                election: dataStore.elections[electionIndex]
            });
        }
        
        // Real blockchain mode
        const { contract } = await connectToFabric();
        await contract.submitTransaction('updateElection', id, JSON.stringify(updatedElection));
        res.json({ message: 'Election updated successfully' });
    } catch (error) {
        console.error('Error updating election:', error);
        res.status(500).json({ error: 'Failed to update election' });
    }
});

// Delete an election
app.delete('/api/elections/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.query.adminId as string;
        
        // Check if we're in simulation mode
        if (MOCK_MODE) {
            console.log(`Deleting election with ID: ${id} by admin: ${adminId}`);
            
            // Find the election in the simulation database
            const electionIndex = dataStore.elections.findIndex((e: SimElection) => e.id === id);
            
            if (electionIndex === -1) {
                return res.status(404).json({
                    error: 'Election not found',
                    details: `No election found with ID ${id}`
                });
            }
            
            // Remove the election
            const deletedElection = dataStore.elections.splice(electionIndex, 1)[0];
            
            // Save the updated simulation data
            saveSimulationData();
            
            console.log(`Election deleted successfully: ${deletedElection.id}`);
            return res.json({
                message: 'Election deleted successfully',
                simulationMode: true,
                election: deletedElection
            });
        }
        
        // Real blockchain mode
        const { contract } = await connectToFabric();
        await contract.submitTransaction('deleteElection', id);
        res.json({ message: 'Election deleted successfully' });
    } catch (error) {
        console.error('Error deleting election:', error);
        res.status(500).json({ error: 'Failed to delete election' });
    }
});

// Cast a vote in an election
app.post('/api/votes/cast', async (req, res) => {
    try {
        const { electionId, candidateId, voterId } = req.body;
        
        if (!electionId || !candidateId || !voterId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Check if we're in simulation mode
        if (MOCK_MODE) {
            console.log(`Casting vote for candidate ${candidateId} in election ${electionId} by voter ${voterId}`);
            
            // Find the election
            const electionIndex = dataStore.elections.findIndex((e: SimElection) => e.id === electionId);
            
            if (electionIndex === -1) {
                return res.status(404).json({ error: 'Election not found' });
            }
            
            const election = dataStore.elections[electionIndex];
            
            // Check if election is active
            if (election.status !== 'active') {
                return res.status(400).json({ error: 'Election is not active' });
            }
            
            // Check if voter exists
            const voter = dataStore.voters.find((v: SimVoter) => v.id === voterId);
            if (!voter) {
                return res.status(404).json({ error: 'Voter not found' });
            }
            
            // Check if voter has already voted in this election
            const existingVote = dataStore.votes.find((v: SimVote) => v.electionId === electionId && v.voterId === voterId);
            if (existingVote) {
                return res.status(400).json({ error: 'Voter has already cast a vote in this election' });
            }
            
            // Find the candidate
            const candidateIndex = election.candidates.findIndex((c: any) => c.id === candidateId);
            if (candidateIndex === -1) {
                return res.status(404).json({ error: 'Candidate not found' });
            }
            
            // Record the vote
            const newVote: SimVote = {
                electionId,
                candidateId,
                voterId,
                timestamp: new Date().toISOString()
            };
            
            dataStore.votes.push(newVote);
            
            // Update vote count for candidate
            election.candidates[candidateIndex].voteCount += 1;
            election.totalVotes += 1;
            
            // Save the updated simulation data
            saveSimulationData();
            
            console.log(`Vote cast successfully by ${voterId} for ${candidateId} in election ${electionId}`);
            return res.json({
                message: 'Vote cast successfully',
                simulationMode: true
            });
        }
        
        // Real blockchain mode
        const { contract } = await connectToFabric();
        await contract.submitTransaction('castVote', electionId, candidateId, voterId);
        res.json({ message: 'Vote cast successfully' });
    } catch (error) {
        console.error('Error casting vote:', error);
        res.status(500).json({ error: 'Failed to cast vote' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { contract } = await connectToFabric();
        const { studentId, password } = req.body;
        const result = await contract.evaluateTransaction('authenticateVoter', studentId, password);
        const voter = JSON.parse(result.toString());
        res.json({ token: 'dummy-token', user: voter }); // In production, use proper JWT
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Start server with dynamic port allocation
async function startServer() {
    try {
        // Check if the requested port is available, otherwise find an available one
        const actualPort = await findAvailablePort(parseInt(port.toString()));
        
        // Update the port in the environment for other components to use
        process.env.API_PORT = actualPort.toString();
        
        // Start the server on the available port
        app.listen(actualPort, () => {
            console.log(`Server running at http://localhost:${actualPort}`);
            
            // Write the port to a file so other processes can discover it
            const portFilePath = path.join(__dirname, '..', '..', '.api-port');
            fs.writeFileSync(portFilePath, actualPort.toString());
            console.log(`Port information saved to ${portFilePath}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Get election results endpoint
app.get('/api/elections/:id/results', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if we're in simulation mode
        if (MOCK_MODE) {
            console.log(`Getting results for election with ID: ${id}`);
            
            // Find the election in the simulation database
            const election = dataStore.elections.find((e: SimElection) => e.id === id);
            
            if (!election) {
                return res.status(404).json({ error: 'Election not found' });
            }
            
            // Get all votes for this election from the simulation data
            const electionVotes = dataStore.votes.filter((v: SimVote) => v.electionId === id);
            
            // Count votes by candidate based on actual votes cast
            const votesByCandidate: { [candidateId: string]: number } = {};
            
            // Initialize with all candidates having 0 votes
            election.candidates.forEach((candidate: any) => {
                votesByCandidate[candidate.id] = 0;
            });
            
            // Count actual votes from the votes array
            electionVotes.forEach((vote: SimVote) => {
                votesByCandidate[vote.candidateId] = (votesByCandidate[vote.candidateId] || 0) + 1;
            });
            
            // Log the actual votes for debugging
            console.log('Actual votes from simulation data:', JSON.stringify(electionVotes));
            console.log('Vote counts by candidate:', JSON.stringify(votesByCandidate));
            
            // Create results object using the actual vote counts
            const results = {
                votes: votesByCandidate,
                totalVotes: electionVotes.length,
                updated_at: new Date().toISOString()
            };
            
            console.log(`Returning results for election ${id}:`, JSON.stringify(results));
            return res.json(results);
        }
        
        // Real blockchain mode
        const { contract } = await connectToFabric();
        const result = await contract.evaluateTransaction('getElectionResults', id);
        const results = JSON.parse(result.toString());
        res.json(results);
    } catch (error) {
        console.error('Error getting election results:', error);
        res.status(500).json({ error: 'Failed to get election results' });
    }
});

// Start the server
startServer();
