import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Vote, Calendar, Users, Clock } from "lucide-react";
import { api, Election } from "../services/api";
import toast from "react-hot-toast";

const Elections: React.FC = () => {
  const navigate = useNavigate();
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadElections();
  }, []);

  const loadElections = async () => {
    try {
      setLoading(true);
      const electionList = await api.listElections();
      
      // Sort elections: active first, then upcoming, then ended
      const sortedElections = [...electionList].sort((a, b) => {
        const statusOrder = { active: 0, upcoming: 1, ended: 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      });
      
      setElections(sortedElections);
      setError(null);
    } catch (err) {
      console.error('Failed to load elections:', err);
      setError('Failed to load elections. Please try again.');
      toast.error('Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Election["status"]) => {
    switch (status) {
      case "upcoming":
        return "bg-yellow-100 text-yellow-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "ended":
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-100 to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Department Elections</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            View and participate in current and upcoming department elections. Your vote shapes the future of your academic community.
          </p>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
            <p className="mt-2 text-gray-600">Loading elections...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-red-50 text-red-700 p-4 rounded-md inline-block">
              {error}
            </div>
            <button 
              onClick={loadElections}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 block mx-auto"
            >
              Try Again
            </button>
          </div>
        ) : elections.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No elections are currently available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {elections.map((election) => (
              <div
                key={election.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {election.title}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(
                        election.status
                      )}`}
                    >
                      {election.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{election.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-5 w-5 mr-2" />
                      <span>
                        {new Date(election.startDate).toLocaleDateString()} -{" "}
                        {new Date(election.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="h-5 w-5 mr-2" />
                      <span>{election.totalVoters ? election.totalVoters.toLocaleString() : 0} eligible voters</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-5 w-5 mr-2" />
                      <span>
                        {election.status === "upcoming"
                          ? "Starts in " +
                            Math.ceil(
                              (new Date(election.startDate).getTime() - new Date().getTime()) /
                                (1000 * 60 * 60 * 24)
                            ) +
                            " days"
                          : election.status === "active"
                          ? "Ends in " +
                            Math.ceil(
                              (new Date(election.endDate).getTime() - new Date().getTime()) /
                                (1000 * 60 * 60 * 24)
                            ) +
                            " days"
                          : "Election ended"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium text-gray-900">Candidates:</h4>
                    {election.candidates.length === 0 ? (
                      <div className="text-sm text-gray-600 pl-2">No candidates available</div>
                    ) : (
                      election.candidates.map((candidate) => (
                        <div key={candidate.id} className="text-sm text-gray-600 pl-2">
                          • {candidate.name} - {candidate.position} {candidate.year ? `(${candidate.year})` : ''}
                        </div>
                      ))
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (election.status === "active") {
                        // For active elections, check if user is logged in before allowing to vote
                        if (localStorage.getItem('userAuthenticated') === 'true') {
                          navigate(`/cast-vote/${election.id}`);
                        } else {
                          toast.error('Please log in to vote');
                          navigate('/login', { state: { returnUrl: `/elections/${election.id}` } });
                        }
                      } else {
                        // For non-active elections, just show details
                        navigate(`/elections/${election.id}`);
                      }
                    }}
                    className={`mt-6 w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      election.status === "active"
                        ? "bg-indigo-600 hover:bg-indigo-700"
                        : election.status === "upcoming"
                        ? "bg-yellow-600 hover:bg-yellow-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                    disabled={false}
                  >
                    <Vote className="h-5 w-5 mr-2" />
                    {election.status === "active"
                      ? "Vote Now"
                      : election.status === "upcoming"
                      ? "View Details"
                      : "View Results"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Elections;