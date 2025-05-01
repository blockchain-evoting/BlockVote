import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { RealtimeService } from '../services/realtimeService';
import { api } from '../services/api';
import type { Election } from '../services/api';
import { ArrowLeft, BarChart2, Award, AlertTriangle, Loader } from 'lucide-react';

interface ElectionWithPhotos extends Election {
    candidates: Array<Election['candidates'][0] & { photoUrl?: string }>;
}

const realtimeService = new RealtimeService();

export const Results: React.FC = () => {
    const { id } = useParams<{ id?: string }>();
    const [elections, setElections] = useState<ElectionWithPhotos[]>([]);
    const [selectedElection, setSelectedElection] = useState<ElectionWithPhotos | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadElections = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Get all elections
                const allElections = await api.listElections();
                
                // Filter for completed elections
                const completedElections = allElections.filter(e => e.status === 'ended');
                
                if (completedElections.length === 0) {
                    setError('No completed elections found');
                    setLoading(false);
                    return;
                }
                
                // Process each election to add vote counts and photos
                const processedElections = await Promise.all(
                    completedElections.map(async (election) => {
                        // Get results for this election
                        const results = await realtimeService.getElectionResults(election.id);
                        
                        // Calculate total votes
                        const totalVotes = Object.values(results.votes).reduce((a, b) => a + b, 0);
                        
                        // Add vote counts to candidates
                        const candidatesWithVotes = election.candidates.map(candidate => ({
                            ...candidate,
                            voteCount: results.votes[candidate.id] || 0,
                            photoUrl: `/candidates/${candidate.id}.jpg` // Placeholder for photos
                        }));
                        
                        // Sort candidates by vote count (highest first)
                        candidatesWithVotes.sort((a, b) => b.voteCount - a.voteCount);
                        
                        return {
                            ...election,
                            candidates: candidatesWithVotes,
                            totalVotes
                        };
                    })
                );
                
                setElections(processedElections);
                
                // If an ID is provided, select that election
                if (id) {
                    const selected = processedElections.find(e => e.id === id);
                    if (selected) {
                        setSelectedElection(selected);
                    } else {
                        setError(`Election with ID ${id} not found or not completed`);
                    }
                } else if (processedElections.length > 0) {
                    // Otherwise select the most recent completed election
                    setSelectedElection(processedElections[0]);
                }
                
                setLoading(false);
            } catch (error) {
                console.error('Error loading election results:', error);
                setError('Failed to load election results. Please try again.');
                setLoading(false);
            }
        };
        
        loadElections();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-white via-purple-100 to-white py-12 px-4 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="h-12 w-12 animate-spin text-indigo-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading election results...</p>
                </div>
            </div>
        );
    }

    if (error || elections.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-white via-purple-100 to-white py-12 px-4">
                <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center text-red-600 mb-4">
                        <AlertTriangle className="h-6 w-6 mr-2" />
                        <h2 className="text-xl font-semibold">No Completed Elections</h2>
                    </div>
                    <p className="text-gray-700 mb-6">{error || 'There are no completed elections to show results for.'}</p>
                    <Link 
                        to="/elections"
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Elections
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-purple-100 to-white py-12 px-4">
            <div className="container mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <Link 
                        to="/elections"
                        className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Elections
                    </Link>
                    
                    {elections.length > 1 && (
                        <div className="relative">
                            <select
                                className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm leading-5 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                value={selectedElection?.id || ''}
                                onChange={(e) => {
                                    const selected = elections.find(election => election.id === e.target.value);
                                    if (selected) setSelectedElection(selected);
                                }}
                            >
                                {elections.map(election => (
                                    <option key={election.id} value={election.id}>
                                        {election.title}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    )}
                </div>
                
                {selectedElection && (
                    <>
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
                            <div className="bg-indigo-600 p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <h1 className="text-2xl md:text-3xl font-bold">{selectedElection.title} Results</h1>
                                    <BarChart2 className="h-8 w-8 text-white opacity-75" />
                                </div>
                                <p className="mt-2 text-indigo-100">
                                    Election ended on {new Date(selectedElection.endDate).toLocaleDateString()}
                                </p>
                            </div>
                            
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold text-gray-800">Final Results</h2>
                                    <div className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
                                        {selectedElection.totalVotes} Total Votes
                                    </div>
                                </div>
                                
                                {/* Winner Section */}
                                {selectedElection.candidates.length > 0 && (
                                    <div className="mb-8 bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
                                        <div className="flex items-center mb-4">
                                            <Award className="h-6 w-6 text-yellow-600 mr-2" />
                                            <h3 className="text-lg font-semibold text-yellow-800">Winner</h3>
                                        </div>
                                        <div className="flex flex-col md:flex-row items-center">
                                            {selectedElection.candidates[0].photoUrl && (
                                                <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                                                    <div className="relative">
                                                        <img
                                                            src={selectedElection.candidates[0].photoUrl}
                                                            alt={selectedElection.candidates[0].name}
                                                            className="w-24 h-24 rounded-full object-cover border-4 border-yellow-400"
                                                        />
                                                        <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1">
                                                            <Award className="h-5 w-5 text-white" />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 text-center md:text-left">
                                                    {selectedElection.candidates[0].name}
                                                </h3>
                                                {selectedElection.candidates[0].party && (
                                                    <p className="text-gray-600 text-center md:text-left">
                                                        {selectedElection.candidates[0].party}
                                                    </p>
                                                )}
                                                <div className="mt-2 flex items-center justify-center md:justify-start">
                                                    <span className="text-2xl font-bold text-yellow-700">
                                                        {selectedElection.candidates[0].voteCount} votes
                                                    </span>
                                                    <span className="ml-2 text-sm font-medium text-gray-500">
                                                        ({((selectedElection.candidates[0].voteCount / selectedElection.totalVotes) * 100).toFixed(1)}%)
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {/* All Candidates Results */}
                                <div className="space-y-6">
                                    {selectedElection.candidates.map((candidate, index) => (
                                        <div key={candidate.id} className="bg-white rounded-lg border border-gray-200 p-4 transition-all hover:shadow-md">
                                            <div className="flex items-start">
                                                <div className="flex-shrink-0 mr-4">
                                                    <div className="relative">
                                                        {candidate.photoUrl ? (
                                                            <img
                                                                src={candidate.photoUrl}
                                                                alt={candidate.name}
                                                                className="w-16 h-16 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                                                                <span className="text-xl font-bold text-indigo-600">
                                                                    {candidate.name.charAt(0)}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {index === 0 && (
                                                            <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                                                                <Award className="h-3 w-3 text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-gray-900">
                                                                {index + 1}. {candidate.name}
                                                            </h3>
                                                            {candidate.party && (
                                                                <p className="text-sm text-gray-600">{candidate.party}</p>
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-lg font-bold text-indigo-600">
                                                                {candidate.voteCount} votes
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {((candidate.voteCount / selectedElection.totalVotes) * 100).toFixed(1)}%
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2">
                                                        <div className="relative pt-1">
                                                            <div className="overflow-hidden h-2 text-xs flex rounded bg-indigo-200">
                                                                <div
                                                                    style={{ width: `${Math.max(5, (candidate.voteCount / selectedElection.totalVotes) * 100)}%` }}
                                                                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${index === 0 ? 'bg-yellow-500' : 'bg-indigo-500'} transition-all duration-500`}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                            <h2 className="text-xl font-semibold mb-4">Election Statistics</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-indigo-50 p-4 rounded-lg">
                                    <p className="text-sm text-indigo-600 mb-1">Total Eligible Voters</p>
                                    <p className="text-2xl font-bold">{selectedElection.totalVoters}</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <p className="text-sm text-green-600 mb-1">Total Votes Cast</p>
                                    <p className="text-2xl font-bold">{selectedElection.totalVotes}</p>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-sm text-blue-600 mb-1">Voter Turnout</p>
                                    <p className="text-2xl font-bold">
                                        {((selectedElection.totalVotes / selectedElection.totalVoters) * 100).toFixed(1)}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Results;