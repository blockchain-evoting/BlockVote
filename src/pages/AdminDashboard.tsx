import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  BarChart2,
  AlertTriangle,
  Clock,
  Loader,
  RefreshCw,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import VoterUpload from '../components/VoterUpload';
import AddVoterForm from '../components/AddVoterForm';
import VoterList from '../components/VoterList';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [stats, setStats] = useState({
        totalVoters: 0,
        activeElections: 0,
        pendingElections: 0
    });
    
    // Check if admin is authenticated
    useEffect(() => {
        const isAdmin = localStorage.getItem('adminAuthenticated') === 'true';
        if (!isAdmin) {
            navigate('/admin/login');
            return;
        }
        
        fetchDashboardData();
    }, [navigate]);
    
    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch voters count
            const voters = await api.listVoters();
            
            // Fetch elections
            const elections = await api.listElections();
            
            // Calculate stats
            const activeElections = elections.filter(e => e.status === 'active').length;
            const pendingElections = elections.filter(e => e.status === 'upcoming').length;
            
            setStats({
                totalVoters: voters.length,
                activeElections,
                pendingElections
            });
            
            setError(null);
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
            setError('Failed to load dashboard data');
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
                        <span className="text-indigo-600 mr-2">E</span>
                        <span>Voting Admin</span>
                    </h1>
                    
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => {
                                localStorage.removeItem('adminAuthenticated');
                                toast.success('Logged out successfully');
                                navigate('/admin/login');
                            }}
                            className="hidden md:flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </button>
                        
                        {/* Mobile menu button */}
                        <button 
                            className="md:hidden rounded-md p-2 inline-flex items-center justify-center text-gray-500 hover:text-gray-600 hover:bg-gray-100"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
                
                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-200 py-2">
                        <div className="container mx-auto px-4 space-y-1">
                            <Link 
                                to="/admin/elections"
                                className="block py-2 px-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                            >
                                Manage Elections
                            </Link>
                            <Link 
                                to="/admin/elections/new"
                                className="block py-2 px-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                            >
                                Create Election
                            </Link>
                            <Link 
                                to="/admin/candidates"
                                className="block py-2 px-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                            >
                                Manage Candidates
                            </Link>
                            <Link 
                                to="/admin/results"
                                className="block py-2 px-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                            >
                                View Results
                            </Link>
                            <Link 
                                to="/admin/settings"
                                className="block py-2 px-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                            >
                                Settings
                            </Link>
                            <button 
                                onClick={() => {
                                    localStorage.removeItem('adminAuthenticated');
                                    toast.success('Logged out successfully');
                                    navigate('/admin/login');
                                }}
                                className="flex w-full items-center py-2 px-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </header>
            
            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
                    
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {loading ? (
                            <div className="col-span-3 bg-white p-6 rounded-xl shadow flex justify-center items-center">
                                <Loader className="h-6 w-6 text-indigo-600 animate-spin mr-2" />
                                <span>Loading dashboard data...</span>
                            </div>
                        ) : error ? (
                            <div className="col-span-3 bg-white p-6 rounded-xl shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center text-red-600">
                                        <AlertTriangle className="h-5 w-5 mr-2" />
                                        <h3 className="text-lg font-medium">Error Loading Data</h3>
                                    </div>
                                    <button 
                                        onClick={fetchDashboardData}
                                        className="flex items-center text-sm text-indigo-600 hover:text-indigo-500"
                                    >
                                        <RefreshCw className="h-4 w-4 mr-1" />
                                        Retry
                                    </button>
                                </div>
                                <p className="text-gray-700">{error}</p>
                            </div>
                        ) : (
                            <>
                                <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition-shadow">
                                    <div className="flex items-center">
                                        <div className="p-3 bg-indigo-100 rounded-full">
                                            <Users className="h-8 w-8 text-indigo-600" />
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-sm font-medium text-gray-500">Total Voters</h3>
                                            <p className="text-3xl font-bold text-gray-900">{stats.totalVoters.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition-shadow">
                                    <div className="flex items-center">
                                        <div className="p-3 bg-green-100 rounded-full">
                                            <BarChart2 className="h-8 w-8 text-green-600" />
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-sm font-medium text-gray-500">Active Elections</h3>
                                            <p className="text-3xl font-bold text-gray-900">{stats.activeElections}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition-shadow">
                                    <div className="flex items-center">
                                        <div className="p-3 bg-amber-100 rounded-full">
                                            <Clock className="h-8 w-8 text-amber-600" />
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-sm font-medium text-gray-500">Pending Elections</h3>
                                            <p className="text-3xl font-bold text-gray-900">{stats.pendingElections}</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Voter Management */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Voter Management</h2>
                        <div className="bg-white rounded-xl shadow overflow-hidden">
                            <Tabs defaultValue="list" className="w-full">
                                <TabsList className="px-4 pt-4">
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
                    </div>

                    {/* System Alerts */}
                    <div className="bg-white p-6 rounded-xl shadow mb-8 hover:shadow-md transition-shadow">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                            System Alerts
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-start p-4 bg-amber-50 rounded-lg border border-amber-100">
                                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-3" />
                                <div>
                                    <h3 className="font-medium text-amber-800">Upcoming Election</h3>
                                    <p className="text-amber-700">Student Council Election starts in 2 days</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                            <Link
                                to="/admin/elections"
                                className="bg-white p-6 rounded-xl shadow hover:shadow-md transition-shadow border-l-4 border-indigo-500"
                            >
                                <h3 className="font-medium text-gray-900">Manage Elections</h3>
                                <p className="text-gray-500 text-sm mt-1">View and edit all elections</p>
                            </Link>
                            <Link
                                to="/admin/elections/new"
                                className="bg-white p-6 rounded-xl shadow hover:shadow-md transition-shadow border-l-4 border-green-500"
                            >
                                <h3 className="font-medium text-gray-900">Create Election</h3>
                                <p className="text-gray-500 text-sm mt-1">Set up a new election</p>
                            </Link>
                            <Link
                                to="/admin/candidates"
                                className="bg-white p-6 rounded-xl shadow hover:shadow-md transition-shadow border-l-4 border-blue-500"
                            >
                                <h3 className="font-medium text-gray-900">Manage Candidates</h3>
                                <p className="text-gray-500 text-sm mt-1">Add or edit candidates</p>
                            </Link>
                            <Link
                                to="/admin/results"
                                className="bg-white p-6 rounded-xl shadow hover:shadow-md transition-shadow border-l-4 border-purple-500"
                            >
                                <h3 className="font-medium text-gray-900">View Results</h3>
                                <p className="text-gray-500 text-sm mt-1">Check election results</p>
                            </Link>
                            <Link
                                to="/admin/settings"
                                className="bg-white p-6 rounded-xl shadow hover:shadow-md transition-shadow border-l-4 border-gray-500"
                            >
                                <h3 className="font-medium text-gray-900">Settings</h3>
                                <p className="text-gray-500 text-sm mt-1">Configure system settings</p>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;