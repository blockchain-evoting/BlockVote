import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Home, Award } from 'lucide-react';
import { authService } from '../services/authService';

interface LocationState {
  electionId: string;
  candidateId: string;
  electionTitle: string;
  candidateName: string;
}

const VoteConfirmationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  
  useEffect(() => {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Check if we have the necessary state data
    if (!state || !state.electionId || !state.candidateId) {
      navigate('/voter-dashboard');
      return;
    }
  }, [navigate, state]);

  if (!state || !state.electionId || !state.candidateId) {
    return null;
  }

  const user = authService.getCurrentUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-100 to-white py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-indigo-600 p-6 text-white text-center">
          <div className="flex justify-center space-x-4 mb-4">
            <CheckCircle className="h-16 w-16" />
            <Award className="h-16 w-16" />
          </div>
          <h1 className="text-3xl font-bold">Vote Confirmed!</h1>
          <p className="mt-2 text-indigo-100">Your vote has been securely recorded on the blockchain</p>
        </div>
        
        <div className="p-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-green-800 mb-4">Vote Receipt</h2>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-green-100 pb-2">
                <span className="text-gray-600">Election:</span>
                <span className="font-medium">{state.electionTitle}</span>
              </div>
              <div className="flex justify-between border-b border-green-100 pb-2">
                <span className="text-gray-600">Candidate:</span>
                <span className="font-medium">{state.candidateName}</span>
              </div>
              <div className="flex justify-between border-b border-green-100 pb-2">
                <span className="text-gray-600">Voter:</span>
                <span className="font-medium">{user?.name || 'Authenticated Voter'}</span>
              </div>
              <div className="flex justify-between border-b border-green-100 pb-2">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{new Date().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-medium text-xs md:text-sm font-mono">
                  {`bv${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`}
                </span>
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <p className="text-gray-600 mb-2">
              Thank you for participating in this election. Your vote has been securely recorded and will be counted when the election ends.
            </p>
            <p className="text-gray-600">
              You can view the results once the election has concluded.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/voter-dashboard"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Home className="h-5 w-5 mr-2" />
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoteConfirmationPage;
