import React from "react";
import { Vote, Calendar, Users, Clock } from "lucide-react";

interface Election {
  id: string;
  title: string;
  department: string;
  description: string;
  startDate: string;
  endDate: string;
  totalVoters: number;
  status: "upcoming" | "active" | "ended";
  candidates: Array<{
    id: string;
    name: string;
    position: string;
    department: string;
    year: string;
  }>;
}

const Elections: React.FC = () => {
  // Mock data - replace with actual data from your backend
  const elections: Election[] = [
    {
      id: "1",
      title: "Computer Science Department Elections",
      department: "Computer Science",
      description: "Annual elections for Computer Science Department Student Council positions",
      startDate: "2025-04-01",
      endDate: "2025-04-02",
      totalVoters: 450,
      status: "upcoming",
      candidates: [
        {
          id: "1",
          name: "John Smith",
          position: "Department President",
          department: "Computer Science",
          year: "3rd Year"
        },
        {
          id: "2",
          name: "Sarah Johnson",
          position: "Department Vice President",
          department: "Computer Science",
          year: "3rd Year"
        }
      ]
    },
    {
      id: "2",
      title: "Engineering Department Elections",
      department: "Engineering",
      description: "Select your Engineering Department Representatives",
      startDate: "2025-03-24",
      endDate: "2025-03-25",
      totalVoters: 600,
      status: "active",
      candidates: [
        {
          id: "3",
          name: "Michael Chen",
          position: "Department Representative",
          department: "Engineering",
          year: "4th Year"
        },
        {
          id: "4",
          name: "Emily Brown",
          position: "Department Representative",
          department: "Engineering",
          year: "3rd Year"
        }
      ]
    },
    {
      id: "3",
      title: "Business School Council Elections",
      department: "Business Administration",
      description: "Choose your Business School student representatives",
      startDate: "2025-04-15",
      endDate: "2025-04-16",
      totalVoters: 350,
      status: "upcoming",
      candidates: [
        {
          id: "5",
          name: "David Wilson",
          position: "Department President",
          department: "Business Administration",
          year: "4th Year"
        },
        {
          id: "6",
          name: "Lisa Anderson",
          position: "Department Vice President",
          department: "Business Administration",
          year: "3rd Year"
        }
      ]
    }
  ];

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
                    <span>{election.totalVoters.toLocaleString()} eligible voters</span>
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
                  {election.candidates.map((candidate) => (
                    <div key={candidate.id} className="text-sm text-gray-600 pl-2">
                      • {candidate.name} - {candidate.position} ({candidate.year})
                    </div>
                  ))}
                </div>

                <button
                  className={`mt-6 w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    election.status === "active"
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : election.status === "upcoming"
                      ? "bg-yellow-600 hover:bg-yellow-700"
                      : "bg-gray-400 cursor-not-allowed"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                  disabled={election.status === "ended"}
                >
                  <Vote className="h-5 w-5 mr-2" />
                  {election.status === "active"
                    ? "Vote Now"
                    : election.status === "upcoming"
                    ? "View Details"
                    : "Election Ended"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Elections;