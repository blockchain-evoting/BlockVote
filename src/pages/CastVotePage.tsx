import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Check, AlertTriangle, Loader, ArrowLeft } from 'lucide-react';
import { api, Election, Candidate } from '../services/api';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const CastVotePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [election, setElection] = useState<Election | null>(null);
  const [user, setUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      toast.error('Please log in to vote');
      navigate('/login', { state: { returnUrl: `/elections/${id}` } });
      return;
    }

    setUser(authService.getCurrentUser());

    fetchElection();
  }, [id, navigate]);

  const fetchElection = async () => {
    if (!id) {
      setError('Election ID is missing');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const elections = await api.listElections();
      const foundElection = elections.find(e => e.id === id);

      if (!foundElection) {
        setError('Election not found');
        return;
      }

      if (foundElection.status !== 'active') {
        setError(`This election is not currently active. Status: ${foundElection.status}`);
        return;
      }

      setElection(foundElection);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch election:', err);
      setError('Failed to load election data. Please try again.');
      toast.error('Failed to load election');
    } finally {
      setLoading(false);
    }
  };

  const handleVoteSubmit = async () => {
    if (!selectedCandidate || !election || !user) {
      return;
    }

    setIsSubmitting(true);

    try {
      await api.castVote(election.id, selectedCandidate, user.id);
      toast.success('Your vote has been cast successfully!');
      navigate('/vote-confirmation', {
        state: {
          electionId: election.id,
          candidateId: selectedCandidate,
          electionTitle: election.title,
          candidateName: election.candidates.find(c => c.id === selectedCandidate)?.name
        }
      });
    } catch (err) {
      console.error('Failed to cast vote:', err);
      toast.error('Failed to cast your vote. Please try again.');
    } finally {
      setIsSubmitting(false);
      setIsConfirmationOpen(false);
    }
  };

  const openConfirmation = (candidateId: string) => {
    setSelectedCandidate(candidateId);
    setIsConfirmationOpen(true);
  };

  const closeConfirmation = () => {
    setIsConfirmationOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-purple-100 to-white py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading election data...</p>
        </div>
      </div>
    );
  }

  if (error || !election) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-purple-100 to-white py-12 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center text-red-600 mb-4">
            <AlertTriangle className="h-6 w-6 mr-2" />
            <h2 className="text-xl font-semibold">Error</h2>
          </div>
          <p className="text-gray-700 mb-6">{error || 'Election not found'}</p>
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
      <div className="max-w-4xl mx-auto">
        <Link 
          to={`/elections/${election.id}`}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Election Details
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{election.title}</h1>
        <p className="text-gray-600 mb-8">Cast your vote for this election</p>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center mb-6">
            <div className="bg-green-100 p-2 rounded-full">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold ml-3">Select a Candidate</h2>
          </div>
          
          {election.description && (
            <p className="text-gray-600 mb-6">{election.description}</p>
          )}

          <div className="space-y-4">
            {election.candidates.map((candidate) => (
              <div
                key={candidate.id}
                className="border rounded-lg p-4 hover:border-indigo-500 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-grow">
                    <h3 className="text-lg font-medium">{candidate.name}</h3>
                    {candidate.position && (
                      <p className="text-gray-500">{candidate.position}</p>
                    )}
                    {candidate.party && (
                      <p className="text-gray-500">Party: {candidate.party}</p>
                    )}
                    {candidate.department && (
                      <p className="text-gray-500">Department: {candidate.department}</p>
                    )}
                  </div>
                  <button
                    onClick={() => openConfirmation(candidate.id)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Vote
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {isConfirmationOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">Confirm Your Vote</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to vote for{" "}
                <span className="font-semibold">
                  {election.candidates.find((c) => c.id === selectedCandidate)?.name}
                </span>
                ? This action cannot be undone.
              </p>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={closeConfirmation}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleVoteSubmit}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Confirm Vote
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CastVotePage;
