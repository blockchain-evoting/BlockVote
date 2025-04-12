import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, Plus, Trash2 } from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  position: string;
  party: string;
  bio: string;
}

const ElectionCreationPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    type: 'general', // general, student, department
  });

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [newCandidate, setNewCandidate] = useState<Omit<Candidate, 'id'>>({
    name: '',
    position: '',
    party: '',
    bio: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddCandidate = () => {
    if (newCandidate.name && newCandidate.position) {
      setCandidates(prev => [...prev, { ...newCandidate, id: Date.now().toString() }]);
      setNewCandidate({
        name: '',
        position: '',
        party: '',
        bio: '',
      });
    }
  };

  const handleRemoveCandidate = (id: string) => {
    setCandidates(prev => prev.filter(candidate => candidate.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Integrate with blockchain service
      // await blockchainService.createElection({
      //   ...formData,
      //   candidates,
      // });

      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      navigate('/admin-dashboard', {
        state: { message: 'Election created successfully!' }
      });
    } catch (error) {
      console.error('Error creating election:', error);
      // Handle error appropriately
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create New Election</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Election Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
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
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Election Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="general">General Election</option>
                  <option value="student">Student Election</option>
                  <option value="department">Department Election</option>
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
              <input
                type="text"
                placeholder="Party/Affiliation"
                value={newCandidate.party}
                onChange={e => setNewCandidate(prev => ({ ...prev, party: e.target.value }))}
                className="px-3 py-2 border rounded-md"
              />
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
              {candidates.map(candidate => (
                <div key={candidate.id} className="flex items-center justify-between p-4 border rounded-md">
                  <div>
                    <h3 className="font-medium">{candidate.name}</h3>
                    <p className="text-sm text-gray-600">
                      {candidate.position} • {candidate.party}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCandidate(candidate.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin-dashboard')}
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
              {isSubmitting ? 'Creating Election...' : 'Create Election'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ElectionCreationPage;
