import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Vote, History, FileText, Settings, Bell, LogOut, AlertCircle, Loader } from "lucide-react";
import { authService } from "../services/authService";
import { api, Election } from "../services/api";
import toast from "react-hot-toast";

const VoterDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(authService.getCurrentUser());
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    // Get current user
    setUser(authService.getCurrentUser());
    
    // Fetch elections
    fetchElections();
  }, [navigate]);
  
  const fetchElections = async () => {
    try {
      setLoading(true);
      const electionData = await api.listElections();
      setElections(electionData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch elections:', err);
      setError('Failed to load elections. Please try again.');
      toast.error('Failed to load elections');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = () => {
    authService.logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };
  
  // Find upcoming election
  const upcomingElection = elections.find(election => election.status === 'upcoming') || null;
  
  // Find active election
  const activeElection = elections.find(election => election.status === 'active') || null;
  
  // Recent activity - for now using static data that would be replaced with real activity logs
  const recentActivity = [
    {
      id: 1,
      type: "registration",
      message: "Voter registration verified",
      timestamp: new Date().toISOString(),
    },
    {
      id: 2,
      type: "document",
      message: "ID document approved",
      timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    },
    {
      id: 3,
      type: "notification",
      message: "New election announced",
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-100 to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name || 'Voter'}</h1>
            <p className="mt-2 text-gray-600">
              Student ID: {user?.studentId} | Department: {user?.department}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            to="/elections"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-full">
                <Vote className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Vote Now</h3>
                <p className="text-sm text-gray-500">Participate in active elections</p>
              </div>
            </div>
          </Link>

          <Link
            to="/results"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <History className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Results</h3>
                <p className="text-sm text-gray-500">View election outcomes</p>
              </div>
            </div>
          </Link>

          <Link
            to="/documents"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Documents</h3>
                <p className="text-sm text-gray-500">Manage your voter documents</p>
              </div>
            </div>
          </Link>

          <Link
            to="/settings"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-full">
                <Settings className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Settings</h3>
                <p className="text-sm text-gray-500">Update your preferences</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Election Card */}
          <div className="lg:col-span-2">
            {/* Election Status */}
            {loading ? (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8 flex items-center justify-center">
                <Loader className="h-6 w-6 text-indigo-600 animate-spin mr-2" />
                <span>Loading election data...</span>
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <div className="flex items-center text-red-600 mb-4">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <h2 className="text-xl font-semibold">Error Loading Elections</h2>
                </div>
                <p className="text-gray-700 mb-4">{error}</p>
                <button
                  onClick={fetchElections}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Try Again
                </button>
              </div>
            ) : activeElection ? (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-full mr-3">
                    <Vote className="h-5 w-5 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Active Election</h2>
                  <span className="ml-3 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">LIVE</span>
                </div>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{activeElection.title}</h3>
                    <p className="text-sm text-gray-500">
                      Ends on {new Date(activeElection.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 bg-green-100 px-4 py-2 rounded-full">
                    <span className="text-green-800 font-medium">
                      {Math.ceil((new Date(activeElection.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <Link
                    to={`/cast-vote/${activeElection.id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Vote Now
                  </Link>
                </div>
              </div>
            ) : upcomingElection ? (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <div className="flex items-center">
                  <div className="bg-yellow-100 p-2 rounded-full mr-3">
                    <Bell className="h-5 w-5 text-yellow-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Upcoming Election</h2>
                </div>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{upcomingElection.title}</h3>
                    <p className="text-sm text-gray-500">
                      Scheduled for {new Date(upcomingElection.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 bg-yellow-100 px-4 py-2 rounded-full">
                    <span className="text-yellow-800 font-medium">
                      {Math.ceil((new Date(upcomingElection.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days until election
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <Link
                    to={`/elections/${upcomingElection.id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <div className="flex items-center">
                  <div className="bg-gray-100 p-2 rounded-full mr-3">
                    <Bell className="h-5 w-5 text-gray-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">No Upcoming Elections</h2>
                </div>
                <p className="mt-4 text-gray-600">There are no active or upcoming elections at this time. Check back later for updates.</p>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start">
                  <div
                    className={`p-2 rounded-full mr-3 ${
                      activity.type === "registration"
                        ? "bg-green-100"
                        : activity.type === "document"
                        ? "bg-blue-100"
                        : "bg-yellow-100"
                    }`}
                  >
                    {activity.type === "registration" ? (
                      <Vote className="h-5 w-5 text-green-600" />
                    ) : activity.type === "document" ? (
                      <FileText className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Bell className="h-5 w-5 text-yellow-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full text-sm text-indigo-600 hover:text-indigo-500">
              View All Activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoterDashboard;