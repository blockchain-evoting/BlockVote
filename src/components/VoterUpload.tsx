import React, { useState } from 'react';
import { Upload, AlertCircle, Check } from 'lucide-react';
import Papa from 'papaparse';
import { api, Voter } from '../services/api';

interface CSVVoter {
    studentId: string;
    name: string;
    department: string;
    contact: string;
    password: string;
}

interface ParseResult {
    data: CSVVoter[];
    errors: Papa.ParseError[];
    meta: Papa.ParseMeta;
}

const VoterUpload: React.FC = () => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError(null);
        setSuccess(null);

        try {
            const text = await file.text();
            Papa.parse<CSVVoter>(text, {
                header: true,
                complete: async (results: ParseResult) => {
                    try {
                        const voters = results.data;
                        let successCount = 0;
                        let errorCount = 0;

                        for (const voter of voters) {
                            try {
                                // Hash the password before storing
                                const hashedPassword = await hashPassword(voter.password);
                                
                                await api.registerVoter('admin', {
                                    id: voter.studentId, // Using studentId as the unique identifier
                                    studentId: voter.studentId,
                                    name: voter.name,
                                    department: voter.department,
                                    contact: voter.contact,
                                    password: hashedPassword
                                });
                                successCount++;
                            } catch (err) {
                                console.error(`Failed to register voter ${voter.studentId}:`, err);
                                errorCount++;
                            }
                        }

                        setSuccess(
                            `Successfully registered ${successCount} voters.${
                                errorCount > 0 ? ` Failed to register ${errorCount} voters.` : ''
                            }`
                        );
                    } catch (err) {
                        setError('Failed to process some or all voters. Please check the format and try again.');
                    }
                },
                error: (error: Papa.ParseError) => {
                    setError(`Failed to parse CSV file: ${error.message}`);
                }
            });
        } catch (err) {
            setError('Failed to read the file. Please try again.');
        } finally {
            setUploading(false);
            // Reset the file input
            event.target.value = '';
        }
    };

    // Simple password hashing function (replace with a proper hashing library in production)
    const hashPassword = async (password: string): Promise<string> => {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Upload Voter List</h2>
            <p className="text-gray-600 mb-4">
                Upload a CSV file containing voter details. The file should include columns for:
                studentId, name, department, contact, and password.
            </p>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="voter-csv-upload"
                    disabled={uploading}
                />
                <label
                    htmlFor="voter-csv-upload"
                    className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                        uploading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'
                    }`}
                >
                    <Upload className="h-5 w-5 mr-2" />
                    {uploading ? 'Uploading...' : 'Select CSV File'}
                </label>

                {error && (
                    <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md flex items-start">
                        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md flex items-start">
                        <Check className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{success}</span>
                    </div>
                )}
            </div>

            <div className="mt-4">
                <h3 className="font-semibold mb-2">CSV Format Example:</h3>
                <code className="block bg-gray-50 p-3 rounded text-sm">
                    studentId,name,department,contact,password
                    <br />
                    12345,John Doe,Computer Science,1234567890,password123
                    <br />
                    12346,Jane Smith,Engineering,0987654321,password456
                </code>
            </div>
        </div>
    );
};

export default VoterUpload;
