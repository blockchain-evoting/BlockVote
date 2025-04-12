import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Real-time subscriptions
export const subscribeToVotes = (electionId: string, callback: (payload: any) => void) => {
    return supabase
        .channel(`election-${electionId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'votes',
                filter: `election_id=eq.${electionId}`
            },
            callback
        )
        .subscribe();
};

// File storage
export const uploadCandidatePhoto = async (file: File, candidateId: string) => {
    const { data, error } = await supabase.storage
        .from('candidate-photos')
        .upload(`${candidateId}/photo.${file.name.split('.').pop()}`, file);

    if (error) throw error;
    return data;
};

// Analytics
export const recordVoterActivity = async (voterId: string, action: string) => {
    const { data, error } = await supabase
        .from('voter_activities')
        .insert([
            {
                voter_id: voterId,
                action,
                timestamp: new Date().toISOString()
            }
        ]);

    if (error) throw error;
    return data;
};

// Cache management
export const cacheElectionResults = async (electionId: string, results: any) => {
    const { data, error } = await supabase
        .from('cached_results')
        .upsert([
            {
                election_id: electionId,
                results,
                updated_at: new Date().toISOString()
            }
        ]);

    if (error) throw error;
    return data;
};

export const getCachedResults = async (electionId: string) => {
    const { data, error } = await supabase
        .from('cached_results')
        .select('*')
        .eq('election_id', electionId)
        .single();

    if (error) throw error;
    return data;
};
