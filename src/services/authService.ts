import { api } from './api';

interface LoginCredentials {
    studentId: string;
    password: string;
    contact: string;
}

interface AuthUser {
    id: string;
    studentId: string;
    name: string;
    department: string;
    contact: string;
}

class AuthService {
    private currentUser: AuthUser | null = null;

    async login(credentials: LoginCredentials): Promise<AuthUser> {
        try {
            console.log('Attempting login with credentials:', credentials.studentId);
            
            // Hash the password for comparison
            const hashedPassword = await this.hashPassword(credentials.password);
            console.log('Hashed password:', hashedPassword);
            
            try {
                // Get voter from blockchain
                const voter = await api.getVoter('system', credentials.studentId);
                console.log('Voter found:', voter);
                
                // Verify password and contact
                if (voter.password !== hashedPassword || voter.contact !== credentials.contact) {
                    console.error('Password or contact mismatch');
                    throw new Error('Invalid credentials');
                }

                // Store user info in memory (you might want to use a more persistent storage)
                this.currentUser = {
                    id: voter.id,
                    studentId: voter.studentId,
                    name: voter.name,
                    department: voter.department,
                    contact: voter.contact
                };

                return this.currentUser;
            } catch (error) {
                console.error('Error fetching voter:', error);
                
                // For testing with mock server - hardcoded test user
                if (credentials.studentId === 'TEST123' && 
                    credentials.contact === '1234567890' && 
                    hashedPassword === 'ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f') {
                    
                    console.log('Using hardcoded test user for mock server');
                    
                    this.currentUser = {
                        id: 'voter_test123',
                        studentId: 'TEST123',
                        name: 'Test User',
                        department: 'Computer Science',
                        contact: '1234567890'
                    };
                    
                    return this.currentUser;
                } else {
                    throw new Error('Invalid credentials');
                }
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw new Error('Invalid credentials');
        }
    }

    async hashPassword(password: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    logout(): void {
        this.currentUser = null;
    }

    getCurrentUser(): AuthUser | null {
        return this.currentUser;
    }

    isAuthenticated(): boolean {
        return this.currentUser !== null;
    }
    
    // Get the contact number for OTP verification
    getContactNumber(): string | null {
        return this.currentUser?.contact || null;
    }
}

export const authService = new AuthService();
