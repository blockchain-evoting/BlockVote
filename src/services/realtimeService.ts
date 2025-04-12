import { supabase, subscribeToVotes, cacheElectionResults, getCachedResults } from '../lib/supabase';

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
            // Try to get cached results first
            const cached = await getCachedResults(electionId);
            if (cached && this.isCacheValid(cached.updated_at)) {
                return cached.results;
            }

            // If cache miss or invalid, get fresh results from Fabric
            const results = await this.getFabricElectionResults(electionId);
            
            // Cache the new results
            await cacheElectionResults(electionId, results);
            
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
