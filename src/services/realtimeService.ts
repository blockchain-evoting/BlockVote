import { supabase, subscribeToVotes, cacheElectionResults } from '../lib/supabase';
import { api } from './api';

interface VoteUpdate {
    votes: { [candidateId: string]: number };
}

interface CachedResults {
    election_id: string;
    results: {
        votes: { [candidateId: string]: number };
        totalVotes: number;
    };
    updated_at: string;
}

export class RealtimeService {
    private subscriptions: { [key: string]: any } = {};

    // Subscribe to real-time election updates
    subscribeToElection(electionId: string, onUpdate: (data: VoteUpdate) => void) {
        if (this.subscriptions[electionId]) {
            return;
        }

        this.subscriptions[electionId] = subscribeToVotes(electionId, async (payload) => {
            // Get latest results and update cache
            const results = await this.getFabricElectionResults(electionId);
            await cacheElectionResults(electionId, results);
            onUpdate(results);
        });
    }

    // Unsubscribe from election updates
    unsubscribeFromElection(electionId: string) {
        if (this.subscriptions[electionId]) {
            this.subscriptions[electionId].unsubscribe();
            delete this.subscriptions[electionId];
        }
    }

    // Get election results with caching
    async getElectionResults(electionId: string): Promise<VoteUpdate> {
        try {
            // Always get fresh results from the local API
            console.log('Fetching election results from local API for election:', electionId);
            
            try {
                // Try to get results from the local API first
                const response = await fetch(`${api['request'].defaults.baseURL}/elections/${electionId}/results`);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('Received results from local API:', data);
                    return data;
                }
            } catch (localApiError) {
                console.warn('Error fetching from local API, falling back to Fabric:', localApiError);
            }
            
            // If local API fails, fall back to Fabric
            const results = await this.getFabricElectionResults(electionId);
            return results;
        } catch (error) {
            console.error('Error getting election results:', error);
            throw error;
        }
    }

    // Check if cache is still valid (less than 5 minutes old)
    private isCacheValid(updatedAt: string): boolean {
        const cacheTime = new Date(updatedAt).getTime();
        const now = new Date().getTime();
        const fiveMinutes = 5 * 60 * 1000;
        return now - cacheTime < fiveMinutes;
    }

    // Get election results from Fabric
    private async getFabricElectionResults(electionId: string): Promise<VoteUpdate> {
        // This will be implemented to fetch results from your Fabric chaincode
        // For now, return an empty result
        return {
            votes: {}
        };
    }

    // Upload candidate photo
    async uploadCandidatePhoto(file: File, candidateId: string): Promise<string | null> {
        try {
            const { data: photoUrl } = await supabase.storage
                .from('candidate-photos')
                .upload(`${candidateId}/photo.${file.name.split('.').pop()}`, file);

            return photoUrl?.path || null;
        } catch (error) {
            console.error('Error uploading candidate photo:', error);
            throw error;
        }
    }

    // Get candidate photo URL
    async getCandidatePhotoUrl(candidateId: string): Promise<string | undefined> {
        try {
            const { data } = await supabase.storage
                .from('candidate-photos')
                .createSignedUrl(`${candidateId}/photo.jpg`, 3600); // 1 hour expiry

            return data?.signedUrl;
        } catch (error) {
            console.error('Error getting candidate photo URL:', error);
            return undefined;
        }
    }
}
