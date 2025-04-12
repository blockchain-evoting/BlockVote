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
            // Hash the password for comparison
            const hashedPassword = await this.hashPassword(credentials.password);
            
            // Get voter from blockchain
            const voter = await api.getVoter('system', credentials.studentId);
            
            // Verify password and contact
            if (voter.password !== hashedPassword || voter.contact !== credentials.contact) {
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
