import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit2, Trash2, AlertCircle, Check, Plus, Calendar, Clock, Users, Vote } from 'lucide-react';
import { api, Election } from '../services/api';
import toast from 'react-hot-toast';

const ElectionManagement: React.FC = () => {
  const navigate = useNavigate();
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadElections();
  }, []);

  const loadElections = async () => {
    try {
      setLoading(true);
      const electionList = await api.listElections();
      setElections(electionList);
      setError(null);
    } catch (err) {
      console.error('Failed to load elections:', err);
      setError('Failed to load elections. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (electionId: string) => {
    if (!window.confirm('Are you sure you want to delete this election? This action cannot be undone.')) {
      return;
    }

    try {
      await api.deleteElection('admin', electionId);
      setElections(elections.filter(e => e.id !== electionId));
      setSuccess('Election deleted successfully');
      toast.success('Election deleted successfully');
    } catch (err) {
      console.error('Failed to delete election:', err);
      setError('Failed to delete election');
      toast.error('Failed to delete election');
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
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading elections...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 text-green-700 rounded-md flex items-start">
          <Check className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Elections</h2>
        <Link 
          to="/admin/elections/new" 
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Election
        </Link>
      </div>

      {elections.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">No elections found</p>
          <Link 
            to="/admin/elections/new" 
            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create your first election
          </Link>
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
                <p className="text-gray-600 mb-4">{election.description || 'No description provided'}</p>
                
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
                    <span>{election.totalVoters} eligible voters</span>
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
                  <h4 className="font-medium text-gray-900">Candidates: {election.candidates.length}</h4>
                  {election.candidates.slice(0, 2).map((candidate) => (
                    <div key={candidate.id} className="text-sm text-gray-600 pl-2">
                      • {candidate.name} - {candidate.position}
                    </div>
                  ))}
                  {election.candidates.length > 2 && (
                    <div className="text-sm text-gray-600 pl-2">
                      • And {election.candidates.length - 2} more...
                    </div>
                  )}
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => navigate(`/admin/elections/edit/${election.id}`)}
                    className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(election.id)}
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ElectionManagement;
