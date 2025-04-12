import React, { useEffect, useState } from 'react';
import { RealtimeService } from '../services/realtimeService';
import { api } from '../services/api';
import type { Election } from '../services/api';

interface ElectionWithPhotos extends Election {
    candidates: Array<Election['candidates'][0] & { photoUrl?: string }>;
}

const realtimeService = new RealtimeService();

export const Results: React.FC = () => {
    const [election, setElection] = useState<ElectionWithPhotos | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadElection = async () => {
            try {
                // Get current election from Fabric
                const currentElection = await api.getCurrentElection();
                if (!currentElection) {
                    setLoading(false);
                    return;
                }

                // Get initial results from cache/Fabric
                const results = await realtimeService.getElectionResults(currentElection.id);
                const electionWithVotes: ElectionWithPhotos = {
                    ...currentElection,
                    candidates: currentElection.candidates.map(candidate => ({
                        ...candidate,
                        voteCount: results.votes[candidate.id] || 0
                    })),
                    totalVotes: Object.values(results.votes).reduce((a, b) => a + b, 0)
                };
                setElection(electionWithVotes);

                // Subscribe to real-time updates
                realtimeService.subscribeToElection(currentElection.id, (update) => {
                    setElection(prev => {
                        if (!prev) return null;
                        const updatedCandidates = prev.candidates.map(candidate => ({
                            ...candidate,
                            voteCount: update.votes[candidate.id] || candidate.voteCount
                        }));
                        const totalVotes = Object.values(update.votes).reduce((a, b) => a + b, 0);
                        return {
                            ...prev,
                            candidates: updatedCandidates,
                            totalVotes
                        };
                    });
                });

                // Load candidate photos
                const candidatesWithPhotos = await Promise.all(
                    currentElection.candidates.map(async (candidate) => ({
                        ...candidate,
                        photoUrl: await realtimeService.getCandidatePhotoUrl(candidate.id)
                    }))
                );

                setElection(prev => prev ? {
                    ...prev,
                    candidates: candidatesWithPhotos
                } : null);
                setLoading(false);
            } catch (error) {
                console.error('Error loading election results:', error);
                setLoading(false);
            }
        };

        loadElection();

        return () => {
            if (election?.id) {
                realtimeService.unsubscribeFromElection(election.id);
            }
        };
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (!election) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-gray-700">No Active Election</h2>
                    <p className="mt-2 text-gray-500">There is no active election at the moment.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-8">{election.title} Results</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {election.candidates.map((candidate) => (
                    <div key={candidate.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        {candidate.photoUrl && (
                            <img
                                src={candidate.photoUrl}
                                alt={candidate.name}
                                className="w-full h-48 object-cover"
                            />
                        )}
                        <div className="p-4">
                            <h3 className="text-xl font-semibold">{candidate.name}</h3>
                            <p className="text-gray-600">{candidate.party}</p>
                            <div className="mt-4">
                                <div className="relative pt-1">
                                    <div className="flex mb-2 items-center justify-between">
                                        <div>
                                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                                                Votes
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-semibold inline-block text-indigo-600">
                                                {((candidate.voteCount / election.totalVotes) * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                                        <div
                                            style={{ width: `${(candidate.voteCount / election.totalVotes) * 100}%` }}
                                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-500"
                                        ></div>
                                    </div>
                                </div>
                                <p className="text-center text-lg font-bold text-indigo-600">
                                    {candidate.voteCount} votes
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 text-center">
                <p className="text-gray-600">
                    Total Votes Cast: <span className="font-bold">{election.totalVotes}</span>
                </p>
            </div>
        </div>
    );
};

export default Results;