# E-Voting System Chaincode

This chaincode implements the smart contract logic for an e-voting system using Hyperledger Fabric. It provides functionality for managing voters, elections, candidates, and the voting process.

## Features

- **Voter Management**: Register, update, and verify voters
- **Election Management**: Create and manage elections
- **Voting Process**: Secure vote casting with verification
- **Results Tabulation**: Real-time vote counting and results

## Functions

### Voter Management
- `registerVoter`: Register a new voter
- `getVoter`: Retrieve voter information
- `updateVoter`: Update voter details
- `deleteVoter`: Remove a voter
- `listVoters`: List all registered voters

### Election Management
- `createElection`: Create a new election
- `getElection`: Retrieve election details
- `updateElection`: Update election information
- `listElections`: List all elections

### Voting
- `castVote`: Cast a vote in an election
- `hasVoted`: Check if a voter has already voted
- `getVoteCount`: Get the number of votes for a candidate
- `getElectionResults`: Get the results of an election

## Data Models

### Voter
```typescript
interface Voter {
    id: string;
    studentId: string;
    name: string;
    department: string;
    contact: string;
    password?: string;
}
```

### Election
```typescript
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
```

### Candidate
```typescript
interface Candidate {
    id: string;
    name: string;
    party: string;
    position: string;
    department: string;
    year: string;
    voteCount: number;
}
```

### Vote
```typescript
interface Vote {
    electionId: string;
    candidateId: string;
    voterId: string;
    timestamp: string;
}
```
