import React from "react";
import {
  ChevronRight,
  Lock,
  Vote,
  BarChart,
  Shield,
  Settings,
  Bell,
  CreditCard,
  PieChart,
  ArrowUpRight,
  Clock,
} from "lucide-react";

const EvoteMockupImage: React.FC = () => {
  return (
    <div className="w-full mx-auto">
      {/* Dashboard Preview */}
      <div className="max-w-5xl mx-auto rounded-t-xl overflow-hidden shadow-2xl border border-gray-100">
        {/* Top Bar */}
        <div className="bg-gray-100 px-2 sm:px-4 py-1 sm:py-2 flex items-center space-x-1 sm:space-x-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500"></div>
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
          <div className="flex-grow"></div>
          <div className="flex items-center bg-white rounded-md px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm text-gray-600">
            <Lock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">blockvote.dashboard</span>
            <span className="xs:hidden">blockvote...</span>
          </div>
          <button className="p-0.5 sm:p-1">
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white p-2 sm:p-4">
          <div className="flex flex-col md:flex-row">
            {/* Sidebar */}
            <div className="w-full md:w-1/4 mb-3 sm:mb-6 md:mb-0 pr-0 md:pr-4">
              <div className="flex items-center mb-4 sm:mb-8">
                <div className="bg-black rounded-full p-0.5 sm:p-1 mr-1 sm:mr-2">
                  <Vote className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <span className="text-sm sm:text-base font-semibold">
                  BlockVote
                </span>
              </div>

              <nav className="space-y-2 sm:space-y-4">
                <div className="bg-violet-100 text-voilet-800 rounded-lg p-1.5 sm:p-2 flex items-center">
                  <PieChart className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                  <span className="text-xs sm:text-base">Dashboard</span>
                </div>
                <div className="text-gray-600 p-1.5 sm:p-2 flex items-center">
                  <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                  <span className="text-xs sm:text-base">My Votes</span>
                </div>
                <div className="text-gray-600 p-1.5 sm:p-2 flex items-center">
                  <BarChart className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                  <span className="text-xs sm:text-base">Elections</span>
                </div>
                <div className="text-gray-600 p-1.5 sm:p-2 flex items-center">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                  <span className="text-xs sm:text-base">Security</span>
                </div>
              </nav>
            </div>

            {/* Main Panel */}
            <div className="w-full md:w-3/4">
              {/* User Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-8">
                <div className="flex items-center mb-3 sm:mb-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full mr-2 sm:mr-3"></div>
                  <div>
                    <p className="text-sm sm:text-base font-medium">
                      Hey, Alex
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Voter ID: #384921
                    </p>
                  </div>
                </div>

                <div className="flex w-full sm:w-auto space-x-2 sm:space-x-3">
                  <button className="bg-purple-600 text-white text-xs sm:text-base px-2 sm:px-4 py-1 sm:py-2 rounded-lg">
                    Vote Now
                  </button>
                  <button className="border border-gray-200 text-gray-700 text-xs sm:text-base px-2 sm:px-4 py-1 sm:py-2 rounded-lg">
                    Verify
                  </button>
                  <button className="p-1 sm:p-2 text-gray-500">
                    <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                  <button className="p-1 sm:p-2 text-gray-500">
                    <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
              </div>

              {/* Status Panel */}
              <div className="bg-gray-50 rounded-xl p-3 sm:p-6 mb-3 sm:mb-6">
                <div className="flex flex-col md:flex-row justify-between mb-2 sm:mb-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Your voter status
                    </p>
                    <p className="text-xl sm:text-3xl font-bold">Verified</p>
                    <p className="text-xs sm:text-sm text-green-500 flex items-center mt-0.5 sm:mt-1">
                      <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />{" "}
                      Authentication complete
                    </p>
                  </div>

                  <div className="mt-2 md:mt-0">
                    <p className="text-xs sm:text-sm text-gray-500">
                      Next election
                    </p>
                    <p className="text-sm sm:text-base font-medium">
                      City Council Election
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />{" "}
                      3 days remaining
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
                {/* Recent Elections Panel */}
                <div className="rounded-xl bg-white border border-gray-100 p-2 sm:p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-2 sm:mb-4">
                    <h3 className="text-sm sm:text-base font-medium">
                      Recent Elections
                    </h3>
                    <button className="text-indigo-600 text-xs sm:text-sm">
                      View all
                    </button>
                  </div>
                  <div className="space-y-1 sm:space-y-3">
                    <div className="flex items-center justify-between py-1 sm:py-2 border-b border-gray-100">
                      <span className="text-xs sm:text-sm">
                        Federal Election 2024
                      </span>
                      <span className="text-xs sm:text-sm text-green-500">
                        Completed
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 sm:py-2 border-b border-gray-100">
                      <span className="text-xs sm:text-sm">
                        State Referendum
                      </span>
                      <span className="text-xs sm:text-sm text-gray-400">
                        Verified
                      </span>
                    </div>
                  </div>
                </div>

                {/* Statistics Panel */}
                <div className="rounded-xl bg-white border border-gray-100 p-2 sm:p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-2 sm:mb-4">
                    <h3 className="text-sm sm:text-base font-medium">
                      Election Statistics
                    </h3>
                    <div className="flex space-x-1 sm:space-x-2">
                      <button className="bg-purple-600 text-white text-xxs sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded">
                        1H
                      </button>
                      <button className="text-gray-500 text-xxs sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded">
                        24H
                      </button>
                      <button className="text-gray-500 text-xxs sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded">
                        1W
                      </button>
                      <button className="text-gray-500 text-xxs sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded">
                        1M
                      </button>
                    </div>
                  </div>
                  <div className="h-24 sm:h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                    <p className="text-xs sm:text-sm text-gray-400">
                      Participation graph
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvoteMockupImage;
