import React from 'react';
import { Link } from "react-router-dom";
import {
  Users,
  BarChart2,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import VoterUpload from '../components/VoterUpload';
import AddVoterForm from '../components/AddVoterForm';
import VoterList from '../components/VoterList';

const AdminDashboard: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Voter Management</h2>
                <Tabs defaultValue="list" className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="list">Voter List</TabsTrigger>
                        <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
                        <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                    </TabsList>
                    <TabsContent value="list">
                        <VoterList />
                    </TabsContent>
                    <TabsContent value="bulk">
                        <VoterUpload />
                    </TabsContent>
                    <TabsContent value="manual">
                        <AddVoterForm />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <div className="flex items-center">
                        <Users className="h-10 w-10 text-indigo-600" />
                        <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900">Total Voters</h3>
                            <p className="text-3xl font-bold text-indigo-600">2,547</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <div className="flex items-center">
                        <BarChart2 className="h-10 w-10 text-green-600" />
                        <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900">Active Elections</h3>
                            <p className="text-3xl font-bold text-green-600">3</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <div className="flex items-center">
                        <Clock className="h-10 w-10 text-yellow-600" />
                        <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900">Pending Elections</h3>
                            <p className="text-3xl font-bold text-yellow-600">2</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* System Alerts */}
            <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <AlertTriangle className="h-6 w-6 text-yellow-500 mr-2" />
                    System Alerts
                </h2>
                <div className="space-y-4">
                    <div className="flex items-start p-4 bg-yellow-50 rounded-md">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-3" />
                        <div>
                            <h3 className="font-medium text-yellow-800">Upcoming Election</h3>
                            <p className="text-yellow-700">Student Council Election starts in 2 days</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link
                    to="/admin/elections/new"
                    className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                >
                    <h3 className="font-medium text-gray-900">Create Election</h3>
                    <p className="text-gray-500 text-sm mt-1">Set up a new election</p>
                </Link>
                <Link
                    to="/admin/candidates"
                    className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                >
                    <h3 className="font-medium text-gray-900">Manage Candidates</h3>
                    <p className="text-gray-500 text-sm mt-1">Add or edit candidates</p>
                </Link>
                <Link
                    to="/admin/results"
                    className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                >
                    <h3 className="font-medium text-gray-900">View Results</h3>
                    <p className="text-gray-500 text-sm mt-1">Check election results</p>
                </Link>
                <Link
                    to="/admin/settings"
                    className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                >
                    <h3 className="font-medium text-gray-900">Settings</h3>
                    <p className="text-gray-500 text-sm mt-1">Configure system settings</p>
                </Link>
            </div>
        </div>
    );
};

export default AdminDashboard;