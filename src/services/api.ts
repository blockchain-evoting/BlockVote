import axios from 'axios';

// Dynamic API URL configuration
const getApiBaseUrl = () => {
    // Try to read the API port from the .api-port file via localStorage
    // This file is created by the server when it starts
    // If not available, try to use port 3001 (default simulation server port)
    const apiPort = localStorage.getItem('api_port') || '3001';
    
    console.log(`Using API port: ${apiPort}`);
    
    // Force direct connection to the simulation server
    // This ensures we bypass any proxy issues
    return `http://localhost:${apiPort}/api`;
    
    // Original implementation with proxy support
    // const useProxy = import.meta.env.DEV && !import.meta.env.VITE_DISABLE_PROXY;
    // if (useProxy) {
    //     // In development with proxy, use relative URL
    //     return '/api';
    // } else {
    //     // Direct connection to API server
    //     return `http://localhost:${apiPort}/api`;
    // }
};

// Initialize with a default, but this will be determined dynamically at runtime
let API_BASE_URL = getApiBaseUrl();

export interface Candidate {
    id: string;
    name: string;
    party: string;
    position: string;
    department: string;
    year: string;
    voteCount: number;
}

export interface Election {
    id: string;
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    totalVoters: number;
    totalVotes: number;
    status: 'upcoming' | 'active' | 'ended';
    candidates: Candidate[];
}

export interface Vote {
    electionId: string;
    candidateId: string;
    voterId: string;
    timestamp: string;
}

export interface Voter {
    id: string;
    studentId: string;
    name: string;
    department: string;
    contact: string;
    password?: string;
}

export interface AuthResponse {
    token: string;
    user: {
        id: string;
        role: string;
        name: string;
    };
}

class ApiService {
    private token: string | null = null;

    private async request<T>(method: string, endpoint: string, data?: any): Promise<T> {
        try {
            // Refresh the API URL before each request to ensure we're using the latest configuration
            API_BASE_URL = getApiBaseUrl();
            
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };

            if (this.token) {
                headers['Authorization'] = `Bearer ${this.token}`;
            }
            
            console.log(`Making API request to: ${API_BASE_URL}${endpoint}`);
            
            const response = await axios({
                method,
                url: `${API_BASE_URL}${endpoint}`,
                data,
                headers
            });
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.message || 'An error occurred');
            }
            throw error;
        }
    }

    setToken(token: string) {
        this.token = token;
    }

    clearToken() {
        this.token = null;
    }

    // Auth endpoints
    async login(studentId: string, password: string): Promise<AuthResponse> {
        return this.request<AuthResponse>('POST', '/auth/login', { studentId, password });
    }

    async verifyOtp(studentId: string, otp: string): Promise<AuthResponse> {
        return this.request<AuthResponse>('POST', '/auth/verify-otp', { studentId, otp });
    }

    // Voter Management
    async registerVoter(adminId: string, voter: Omit<Voter, 'id'>): Promise<void> {
        await this.request('POST', '/voters/register', { adminId, voter });
    }

    async listVoters(p0: string): Promise<Voter[]> {
        return this.request<Voter[]>('GET', '/voters');
    }

    async getVoter(adminId: string, studentId: string): Promise<Voter> {
        return this.request<Voter>('GET', `/voters/student/${studentId}?adminId=${adminId}`);
    }

    async updateVoter(adminId: string, voter: Voter): Promise<void> {
        await this.request('PUT', `/voters/${voter.id}`, { ...voter, adminId });
    }

    async deleteVoter(adminId: string, voterId: string): Promise<void> {
        await this.request('DELETE', `/voters/${voterId}?adminId=${adminId}`);
    }

    // Election Management
    async getCurrentElection(): Promise<Election | null> {
        try {
            return await this.request<Election>('GET', '/elections/current');
        } catch (error) {
            console.error('Error getting current election:', error);
            return null;
        }
    }

    async listElections(): Promise<Election[]> {
        return this.request<Election[]>('GET', '/elections');
    }
    
    async createElection(adminId: string, election: Omit<Election, 'id'>): Promise<Election> {
        return this.request<Election>('POST', '/elections', { adminId, election });
    }
    
    async updateElection(adminId: string, election: Election): Promise<Election> {
        return this.request<Election>('PUT', `/elections/${election.id}`, { adminId, ...election });
    }
    
    async deleteElection(adminId: string, electionId: string): Promise<void> {
        await this.request('DELETE', `/elections/${electionId}?adminId=${adminId}`);
    }

    async castVote(electionId: string, candidateId: string, voterId: string): Promise<void> {
        await this.request('POST', '/votes/cast', { electionId, candidateId, voterId });
    }
}

export const api = new ApiService();
