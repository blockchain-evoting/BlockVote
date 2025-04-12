import React from "react";
import { Link } from "react-router-dom";
import { Vote, History, FileText, Settings, Bell } from "lucide-react";

const VoterDashboard: React.FC = () => {
  // Mock data - replace with actual data from your backend
  const upcomingElection = {
    title: "Presidential Election 2025",
    date: "2025-11-03",
    daysLeft: Math.ceil(
      (new Date("2025-11-03").getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    ),
  };

  const recentActivity = [
    {
      id: 1,
      type: "registration",
      message: "Voter registration verified",
      timestamp: "2025-03-23T18:25:00",
    },
    {
      id: 2,
      type: "document",
      message: "ID document approved",
      timestamp: "2025-03-23T15:40:00",
    },
    {
      id: 3,
      type: "notification",
      message: "New election announced",
      timestamp: "2025-03-22T09:15:00",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-100 to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, Voter</h1>
          <p className="mt-2 text-gray-600">
            Access your voting information and participate in elections
          </p>
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
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Next Election</h2>
              <div className="bg-indigo-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900">{upcomingElection.title}</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Date: {new Date(upcomingElection.date).toLocaleDateString()}
                </p>
                <div className="mt-4">
                  <div className="text-3xl font-bold text-indigo-600">
                    {upcomingElection.daysLeft}
                  </div>
                  <div className="text-sm text-gray-600">days until election</div>
                </div>
                <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <Vote className="h-5 w-5 mr-2" />
                  View Election Details
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              <Bell className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                >
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-indigo-100 rounded-full">
                      <div className="h-2 w-2 bg-indigo-600 rounded-full"></div>
                    </div>
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