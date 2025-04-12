import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, User, FileText, CheckCircle } from 'lucide-react';

interface CandidateForm {
  fullName: string;
  position: string;
  party: string;
  bio: string;
  email: string;
  phone: string;
  idNumber: string;
  manifesto: string;
}

const CandidateRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');
  const [formData, setFormData] = useState<CandidateForm>({
    fullName: '',
    position: '',
    party: '',
    bio: '',
    email: '',
    phone: '',
    idNumber: '',
    manifesto: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Integrate with blockchain service
      // const formDataWithImage = new FormData();
      // Object.entries(formData).forEach(([key, value]) => {
      //   formDataWithImage.append(key, value);
      // });
      // if (profileImage) {
      //   formDataWithImage.append('profileImage', profileImage);
      // }
      // await blockchainService.registerCandidate(formDataWithImage);

      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      navigate('/admin-dashboard', {
        state: { message: 'Candidate registration submitted successfully!' }
      });
    } catch (error) {
      console.error('Error registering candidate:', error);
      // Handle error appropriately
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Candidate Registration</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            
            {/* Profile Image Upload */}
            <div className="mb-6">
              <div className="flex items-center space-x-6">
                <div className="shrink-0">
                  {profileImagePreview ? (
                    <img
                      className="h-32 w-32 object-cover rounded-full"
                      src={profileImagePreview}
                      alt="Profile preview"
                    />
                  ) : (
                    <div className="h-32 w-32 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>
                <label className="block">
                  <span className="sr-only">Choose profile photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                </label>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Number
                  </label>
                  <input
                    type="text"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Candidacy Information */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Candidacy Information</h2>
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Party/Affiliation
                  </label>
                  <input
                    type="text"
                    name="party"
                    value={formData.party}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Manifesto
                </label>
                <textarea
                  name="manifesto"
                  value={formData.manifesto}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={5}
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CandidateRegistrationPage;
