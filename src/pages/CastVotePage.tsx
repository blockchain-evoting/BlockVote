import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, AlertTriangle } from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  position: string;
  party: string;
  imageUrl?: string;
}

interface Election {
  id: string;
  title: string;
  description: string;
  candidates: Candidate[];
}

const CastVotePage: React.FC = () => {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Mock election data - will be replaced with actual data from blockchain
  const election: Election = {
    id: "election-2025",
    title: "Presidential Election 2025",
    description: "Cast your vote for the next president",
    candidates: [
      {
        id: "1",
        name: "John Smith",
        position: "President",
        party: "Progressive Party",
        imageUrl: "/candidates/john-smith.jpg"
      },
      {
        id: "2",
        name: "Sarah Johnson",
        position: "President",
        party: "Conservative Party",
        imageUrl: "/candidates/sarah-johnson.jpg"
      }
    ]
  };

  const handleVoteSubmit = async () => {
    if (!selectedCandidate) return;
    
    setIsSubmitting(true);
    try {
      // TODO: Integrate with blockchain service
      // await blockchainService.castVote({
      //   electionId: election.id,
      //   candidateId: selectedCandidate,
      // });
      
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      navigate('/voter-dashboard', { 
        state: { message: 'Your vote has been successfully recorded!' }
      });
    } catch (error) {
      console.error('Error casting vote:', error);
      // Handle error appropriately
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{election.title}</h1>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
            <p className="text-sm text-yellow-700">
              Your vote is anonymous and encrypted. Once submitted, it cannot be changed.
            </p>
          </div>
        </div>

        <div className="grid gap-6 mb-8">
          {election.candidates.map((candidate) => (
            <div
              key={candidate.id}
              className={`border rounded-lg p-6 cursor-pointer transition-all ${
                selectedCandidate === candidate.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => setSelectedCandidate(candidate.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {candidate.imageUrl && (
                    <img
                      src={candidate.imageUrl}
                      alt={candidate.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold">{candidate.name}</h3>
                    <p className="text-gray-600">{candidate.party}</p>
                  </div>
                </div>
                {selectedCandidate === candidate.id && (
                  <Check className="h-6 w-6 text-green-500" />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            onClick={() => navigate('/voter-dashboard')}
          >
            Cancel
          </button>
          <button
            className={`px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 
              ${(!selectedCandidate || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => setIsConfirmationOpen(true)}
            disabled={!selectedCandidate || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Vote'}
          </button>
        </div>

        {/* Confirmation Modal */}
        {isConfirmationOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">Confirm Your Vote</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to cast your vote? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  onClick={() => setIsConfirmationOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  onClick={handleVoteSubmit}
                >
                  Confirm Vote
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
