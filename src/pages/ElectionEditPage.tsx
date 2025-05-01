import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { api, Election, Candidate } from '../services/api';
import toast from 'react-hot-toast';

interface EditCandidate extends Candidate {
  isNew?: boolean;
}

const ElectionEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<Election>>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'upcoming',
  });

  const [candidates, setCandidates] = useState<EditCandidate[]>([]);
  const [newCandidate, setNewCandidate] = useState<Omit<Candidate, 'id'>>({
    name: '',
    position: '',
    party: '',
    department: '',
    year: '',
    voteCount: 0
  });

  useEffect(() => {
    if (id) {
      loadElection(id);
    }
  }, [id]);

  const loadElection = async (electionId: string) => {
    try {
      setLoading(true);
      // Get all elections and find the one with matching ID
      const elections = await api.listElections();
      const election = elections.find(e => e.id === electionId);
      
      if (!election) {
        setError('Election not found');
        return;
      }

      // Format dates for the datetime-local input
      const formatDateForInput = (dateString: string) => {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16); // Format as YYYY-MM-DDTHH:MM
      };

      setFormData({
        ...election,
        startDate: formatDateForInput(election.startDate),
        endDate: formatDateForInput(election.endDate),
      });
      
      setCandidates(election.candidates);
      setError(null);
    } catch (err) {
      console.error('Failed to load election:', err);
      setError('Failed to load election details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddCandidate = () => {
    if (newCandidate.name && newCandidate.position) {
      setCandidates(prev => [
        ...prev, 
        { 
          ...newCandidate, 
          id: `new_${Date.now()}`,
          isNew: true 
        }
      ]);
      
      setNewCandidate({
        name: '',
        position: '',
        party: '',
        department: '',
        year: '',
        voteCount: 0
      });
    } else {
      toast.error('Candidate name and position are required');
    }
  };

  const handleRemoveCandidate = (candidateId: string) => {
    setCandidates(prev => prev.filter(candidate => candidate.id !== candidateId));
  };

  const handleCandidateChange = (candidateId: string, field: keyof Candidate, value: string) => {
    setCandidates(prev => 
      prev.map(candidate => 
        candidate.id === candidateId 
          ? { ...candidate, [field]: value } 
          : candidate
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (candidates.length === 0) {
      toast.error('Please add at least one candidate');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Format the election data for the API
      const electionData: Election = {
        id: id!,
        title: formData.title!,
        description: formData.description || '',
        startDate: new Date(formData.startDate!).toISOString(),
        endDate: new Date(formData.endDate!).toISOString(),
        totalVoters: formData.totalVoters || 0,
        totalVotes: formData.totalVotes || 0,
        status: formData.status as 'upcoming' | 'active' | 'ended',
        candidates: candidates.map(({ isNew, ...candidate }) => candidate)
      };
      
      // Call the API to update the election
      await api.updateElection('admin', electionData);
      
      toast.success('Election updated successfully!');
      navigate('/admin/elections');
    } catch (error) {
      console.error('Error updating election:', error);
      toast.error('Failed to update election. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading election details...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
            {error}
          </div>
          <button
            onClick={() => navigate('/admin/elections')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Back to Elections
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Edit Election</h1>

        <form className="space-y-8" onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Election Title*
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date*
                  </label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date*
                  </label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status || 'upcoming'}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="ended">Ended</option>
                </select>
              </div>
            </div>
          </div>

          {/* Candidate Management */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Candidates</h2>
            
            {/* Add New Candidate */}
            <div className="grid gap-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Candidate Name"
                  value={newCandidate.name}
                  onChange={e => setNewCandidate(prev => ({ ...prev, name: e.target.value }))}
                  className="px-3 py-2 border rounded-md"
                />
                <input
                  type="text"
                  placeholder="Position"
                  value={newCandidate.position}
                  onChange={e => setNewCandidate(prev => ({ ...prev, position: e.target.value }))}
                  className="px-3 py-2 border rounded-md"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Party/Affiliation"
                  value={newCandidate.party}
                  onChange={e => setNewCandidate(prev => ({ ...prev, party: e.target.value }))}
                  className="px-3 py-2 border rounded-md"
                />
                <input
                  type="text"
                  placeholder="Department"
                  value={newCandidate.department}
                  onChange={e => setNewCandidate(prev => ({ ...prev, department: e.target.value }))}
                  className="px-3 py-2 border rounded-md"
                />
                <input
                  type="text"
                  placeholder="Year"
                  value={newCandidate.year}
                  onChange={e => setNewCandidate(prev => ({ ...prev, year: e.target.value }))}
                  className="px-3 py-2 border rounded-md"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddCandidate}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Candidate
                </button>
              </div>
            </div>

            {/* Candidate List */}
            <div className="space-y-4">
              {candidates.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No candidates added yet</p>
              ) : (
                candidates.map(candidate => (
                  <div key={candidate.id} className="border rounded-md p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium">{candidate.name}</h3>
                      <button
                        type="button"
                        onClick={() => handleRemoveCandidate(candidate.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Name</label>
                        <input
                          type="text"
                          value={candidate.name}
                          onChange={e => handleCandidateChange(candidate.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 border rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Position</label>
                        <input
                          type="text"
                          value={candidate.position}
                          onChange={e => handleCandidateChange(candidate.id, 'position', e.target.value)}
                          className="w-full px-3 py-2 border rounded-md text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Party</label>
                        <input
                          type="text"
                          value={candidate.party}
                          onChange={e => handleCandidateChange(candidate.id, 'party', e.target.value)}
                          className="w-full px-3 py-2 border rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Department</label>
                        <input
                          type="text"
                          value={candidate.department}
                          onChange={e => handleCandidateChange(candidate.id, 'department', e.target.value)}
                          className="w-full px-3 py-2 border rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Year</label>
                        <input
                          type="text"
                          value={candidate.year}
                          onChange={e => handleCandidateChange(candidate.id, 'year', e.target.value)}
                          className="w-full px-3 py-2 border rounded-md text-sm"
                        />
                      </div>
                    </div>
                    {!candidate.isNew && (
                      <div className="mt-3">
                        <label className="block text-xs text-gray-500 mb-1">Vote Count</label>
                        <input
                          type="number"
                          value={candidate.voteCount}
                          onChange={e => handleCandidateChange(candidate.id, 'voteCount', e.target.value)}
                          className="w-full px-3 py-2 border rounded-md text-sm"
                          min="0"
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/elections')}
              className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || candidates.length === 0}
              className={`px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700
                ${(isSubmitting || candidates.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ElectionEditPage;
