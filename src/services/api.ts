import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

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
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };

            if (this.token) {
                headers['Authorization'] = `Bearer ${this.token}`;
            }

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

    async listVoters(): Promise<Voter[]> {
        return this.request<Voter[]>('GET', '/voters');
    }

    async updateVoter(voter: Voter): Promise<void> {
        await this.request('PUT', `/voters/${voter.id}`, voter);
    }

    async deleteVoter(voterId: string): Promise<void> {
        await this.request('DELETE', `/voters/${voterId}`);
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

    async castVote(electionId: string, candidateId: string): Promise<void> {
        await this.request('POST', '/votes/cast', { electionId, candidateId });
    }
}

export const api = new ApiService();
