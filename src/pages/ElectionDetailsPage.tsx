import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, ArrowLeft, Vote, Award, BarChart } from 'lucide-react';
import { api, Election } from '../services/api';
import toast from 'react-hot-toast';

const ElectionDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [election, setElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadElection(id);
    }
  }, [id]);

  const loadElection = async (electionId: string) => {
    try {
      setLoading(true);
      // Get all elections and find the one with matching ID
      const elections = await api.listElections();
      const foundElection = elections.find(e => e.id === electionId);
      
      if (!foundElection) {
        setError('Election not found');
        return;
      }

      setElection(foundElection);
      setError(null);
    } catch (err) {
      console.error('Failed to load election:', err);
      setError('Failed to load election details. Please try again.');
      toast.error('Failed to load election details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'ended':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-purple-100 to-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
            <p className="mt-2 text-gray-600">Loading election details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !election) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-purple-100 to-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="bg-red-50 text-red-700 p-4 rounded-md inline-block">
              {error || 'Election not found'}
            </div>
            <button 
              onClick={() => navigate('/elections')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 block mx-auto"
            >
              Back to Elections
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-100 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/elections')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Elections
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 mr-4">
                {election.title}
              </h1>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(
                  election.status
                )}`}
              >
                {election.status}
              </span>
            </div>

            {election.description && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">About this Election</h2>
                <p className="text-gray-700">{election.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">Election Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center text-gray-700">
                    <Calendar className="h-5 w-5 mr-3 text-blue-600" />
                    <div>
                      <div className="font-medium">Start Date</div>
                      <div>{formatDate(election.startDate)}</div>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Clock className="h-5 w-5 mr-3 text-blue-600" />
                    <div>
                      <div className="font-medium">End Date</div>
                      <div>{formatDate(election.endDate)}</div>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Users className="h-5 w-5 mr-3 text-blue-600" />
                    <div>
                      <div className="font-medium">Eligible Voters</div>
                      <div>{election.totalVoters ? election.totalVoters.toLocaleString() : 0} voters</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">Election Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center text-gray-700">
                    <Clock className="h-5 w-5 mr-3 text-blue-600" />
                    <div>
                      {election.status === "upcoming" ? (
                        <>
                          <div className="font-medium">Starts in</div>
                          <div>
                            {Math.ceil(
                              (new Date(election.startDate).getTime() - new Date().getTime()) /
                                (1000 * 60 * 60 * 24)
                            )} days
                          </div>
                        </>
                      ) : election.status === "active" ? (
                        <>
                          <div className="font-medium">Ends in</div>
                          <div>
                            {Math.ceil(
                              (new Date(election.endDate).getTime() - new Date().getTime()) /
                                (1000 * 60 * 60 * 24)
                            )} days
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="font-medium">Election Ended</div>
                          <div>Results are available</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Candidates</h2>
              {election.candidates.length === 0 ? (
                <p className="text-gray-500">No candidates available for this election.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {election.candidates.map((candidate) => (
                    <div key={candidate.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h3 className="font-medium text-lg">{candidate.name}</h3>
                      <p className="text-gray-600">{candidate.position}</p>
                      {candidate.department && (
                        <p className="text-gray-500 text-sm">Department: {candidate.department}</p>
                      )}
                      {candidate.year && (
                        <p className="text-gray-500 text-sm">Year: {candidate.year}</p>
                      )}
                      {candidate.party && (
                        <p className="text-gray-500 text-sm">Party: {candidate.party}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {election.status === "active" && (
              <div className="mt-8">
                <button
                  className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Vote className="h-5 w-5 mr-2" />
                  Vote Now
                </button>
              </div>
            )}
            
            {election.status === "ended" && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Award className="h-5 w-5 mr-2 text-yellow-500" />
                  Election Results
                </h2>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="mb-6">
                    <h3 className="font-medium text-lg mb-3">Vote Distribution</h3>
                    <div className="space-y-4">
                      {election.candidates.map((candidate) => {
                        // Mock vote percentage for demonstration
                        const votePercentage = Math.floor(Math.random() * 100);
                        return (
                          <div key={candidate.id} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{candidate.name}</span>
                              <span className="text-sm font-medium">{votePercentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-blue-600 h-2.5 rounded-full" 
                                style={{ width: `${votePercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="font-medium text-lg mb-3">Statistics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-sm text-gray-500">Total Votes</div>
                        <div className="text-2xl font-bold">{Math.floor(Math.random() * 1000)}</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-sm text-gray-500">Voter Turnout</div>
                        <div className="text-2xl font-bold">{Math.floor(Math.random() * 100)}%</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-sm text-gray-500">Blockchain Confirmations</div>
                        <div className="text-2xl font-bold">{Math.floor(Math.random() * 100)}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center mt-6">
                    <button className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      <BarChart className="h-5 w-5 mr-2" />
                      View Detailed Analytics
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectionDetailsPage;
