import React, { useState } from 'react';
import { AlertCircle, Check, Eye } from 'lucide-react';
import { api } from '../services/api';

interface VoterFormData {
    studentId: string;
    name: string;
    department: string;
    contact: string;
    password: string;
}

const AddVoterForm: React.FC = () => {
    const [formData, setFormData] = useState<VoterFormData>({
        studentId: '',
        name: '',
        department: '',
        contact: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!showPreview) {
            setShowPreview(true);
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // Hash the password before storing
            const hashedPassword = await hashPassword(formData.password);
            
            await api.registerVoter('admin', {
                id: formData.studentId,
                studentId: formData.studentId,
                name: formData.name,
                department: formData.department,
                contact: formData.contact,
                password: hashedPassword
            });

            setSuccess('Voter registered successfully!');
            // Reset form
            setFormData({
                studentId: '',
                name: '',
                department: '',
                contact: '',
                password: ''
            });
            setShowPreview(false);
        } catch (err) {
            setError('Failed to register voter. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setShowPreview(false);
        setError(null);
    };

    const hashPassword = async (password: string): Promise<string> => {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    };

    const departments = [
        'Computer Science',
        'Engineering',
        'Business Administration',
        'Arts and Sciences',
        'Medicine',
        'Law'
    ];

    if (showPreview) {
        return (
            <div className="p-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Preview Voter Details</h2>
                <p className="text-gray-600 mb-6">
                    Please review the voter details before confirming registration.
                </p>

                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Student ID</label>
                        <p className="mt-1 text-lg">{formData.studentId}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <p className="mt-1 text-lg">{formData.name}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Department</label>
                        <p className="mt-1 text-lg">{formData.department}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                        <p className="mt-1 text-lg">{formData.contact}</p>
                    </div>
                </div>

                <div className="flex space-x-4">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Back to Edit
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`flex-1 flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                            loading
                                ? 'bg-indigo-400 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                        }`}
                    >
                        {loading ? 'Registering...' : 'Confirm Registration'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Add New Voter</h2>
            <p className="text-gray-600 mb-6">
                Manually register a new voter by filling out the form below.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
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

                <div>
                    <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">
                        Student ID *
                    </label>
                    <input
                        type="text"
                        id="studentId"
                        name="studentId"
                        required
                        value={formData.studentId}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Enter student ID"
                    />
                </div>

                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full Name *
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Enter full name"
                    />
                </div>

                <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                        Department *
                    </label>
                    <select
                        id="department"
                        name="department"
                        required
                        value={formData.department}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                        <option value="">Select department</option>
                        {departments.map(dept => (
                            <option key={dept} value={dept}>
                                {dept}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="contact" className="block text-sm font-medium text-gray-700">
                        Contact Number *
                    </label>
                    <input
                        type="tel"
                        id="contact"
                        name="contact"
                        required
                        pattern="[0-9]{10}"
                        value={formData.contact}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Enter 10-digit contact number"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password *
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Enter password"
                        minLength={8}
                    />
                    <p className="mt-1 text-sm text-gray-500">
                        Password must be at least 8 characters long
                    </p>
                </div>

                <div>
                    <button
                        type="submit"
                        className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <Eye className="h-5 w-5 mr-2" />
                        Preview Details
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddVoterForm;
