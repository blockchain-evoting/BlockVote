import React, { useState, useEffect, useMemo } from 'react';
import {
    Edit2,
    Trash2,
    AlertCircle,
    Check,
    Search,
    Download,
    ArrowUp,
    ArrowDown,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { api, Voter } from '../services/api';
import { exportToCSV } from '../utils/exportUtils';

interface EditVoterData {
    voter: Voter;
    isNew: boolean;
}

interface SortConfig {
    key: keyof Voter;
    direction: 'asc' | 'desc';
}

const ITEMS_PER_PAGE = 10;

const VoterList: React.FC = () => {
    const [voters, setVoters] = useState<Voter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingVoter, setEditingVoter] = useState<EditVoterData | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState<string>('');
    
    // Sorting state
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        key: 'studentId',
        direction: 'asc'
    });
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        loadVoters();
    }, []);

    const loadVoters = async () => {
        try {
            const voterList = await api.listVoters('admin');
            setVoters(voterList);
        } catch (err) {
            setError('Failed to load voters');
        } finally {
            setLoading(false);
        }
    };

    // Get unique departments for filter dropdown
    const departments = useMemo(() => {
        const depts = new Set(voters.map(v => v.department));
        return Array.from(depts);
    }, [voters]);

    // Filter and sort voters
    const filteredAndSortedVoters = useMemo(() => {
        let result = [...voters];

        // Apply search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(voter =>
                voter.studentId.toLowerCase().includes(searchLower) ||
                voter.name.toLowerCase().includes(searchLower) ||
                voter.department.toLowerCase().includes(searchLower) ||
                voter.contact.includes(searchTerm)
            );
        }

        // Apply department filter
        if (departmentFilter) {
            result = result.filter(voter => voter.department === departmentFilter);
        }

        // Apply sorting
        result.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];
            
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [voters, searchTerm, departmentFilter, sortConfig]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedVoters.length / ITEMS_PER_PAGE);
    const paginatedVoters = filteredAndSortedVoters.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleSort = (key: keyof Voter) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleExport = () => {
        const timestamp = new Date().toISOString().split('T')[0];
        exportToCSV(filteredAndSortedVoters, `voters-${timestamp}.csv`);
    };

    const handleEdit = (voter: Voter) => {
        setEditingVoter({ voter: { ...voter }, isNew: false });
        setError(null);
        setSuccess(null);
    };

    const handleDelete = async (voterId: string) => {
        if (!window.confirm('Are you sure you want to delete this voter?')) {
            return;
        }

        try {
            await api.deleteVoter('admin', voterId);
            setVoters(voters.filter(v => v.id !== voterId));
            setSuccess('Voter deleted successfully');
        } catch (err) {
            setError('Failed to delete voter');
        }
    };

    const handleSave = async () => {
        if (!editingVoter) return;

        try {
            await api.updateVoter('admin', editingVoter.voter);
            setVoters(voters.map(v => 
                v.id === editingVoter.voter.id ? editingVoter.voter : v
            ));
            setSuccess('Voter updated successfully');
            setEditingVoter(null);
        } catch (err) {
            setError('Failed to update voter');
        }
    };

    const handleCancel = () => {
        setEditingVoter(null);
        setError(null);
        setSuccess(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!editingVoter) return;

        setEditingVoter({
            ...editingVoter,
            voter: {
                ...editingVoter.voter,
                [e.target.name]: e.target.value
            }
        });
    };

    if (loading) {
        return <div className="text-center py-4">Loading voters...</div>;
    }

    return (
        <div className="space-y-4">
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

            {/* Search and Filter Controls */}
            <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search voters..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                    </div>
                </div>

                <div className="w-48">
                    <select
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                        className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">All Departments</option>
                        {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleExport}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <Download className="h-5 w-5 mr-2" />
                    Export CSV
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {['studentId', 'name', 'department', 'contact'].map((key) => (
                                <th
                                    key={key}
                                    onClick={() => handleSort(key as keyof Voter)}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                >
                                    <div className="flex items-center">
                                        {key.charAt(0).toUpperCase() + key.slice(1)}
                                        {sortConfig.key === key && (
                                            sortConfig.direction === 'asc' ? 
                                                <ArrowUp className="h-4 w-4 ml-1" /> : 
                                                <ArrowDown className="h-4 w-4 ml-1" />
                                        )}
                                    </div>
                                </th>
                            ))}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedVoters.map(voter => (
                            <tr key={voter.id}>
                                {editingVoter?.voter.id === voter.id ? (
                                    <>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="text"
                                                name="studentId"
                                                value={editingVoter.voter.studentId}
                                                onChange={handleInputChange}
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="text"
                                                name="name"
                                                value={editingVoter.voter.name}
                                                onChange={handleInputChange}
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="text"
                                                name="department"
                                                value={editingVoter.voter.department}
                                                onChange={handleInputChange}
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="text"
                                                name="contact"
                                                value={editingVoter.voter.contact}
                                                onChange={handleInputChange}
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button
                                                onClick={handleSave}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                className="text-gray-600 hover:text-gray-900"
                                            >
                                                Cancel
                                            </button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="px-6 py-4 whitespace-nowrap">{voter.studentId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{voter.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{voter.department}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{voter.contact}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(voter)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(voter.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                    <div className="flex flex-1 justify-between sm:hidden">
                        <button
                            onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                            disabled={currentPage === totalPages}
                            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                                <span className="font-medium">
                                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedVoters.length)}
                                </span>{' '}
                                of <span className="font-medium">{filteredAndSortedVoters.length}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                <button
                                    onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                            page === currentPage
                                                ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoterList;
