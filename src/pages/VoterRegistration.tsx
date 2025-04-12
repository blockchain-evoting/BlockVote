import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Upload } from "lucide-react";
import { voterService, type VoterRegistrationData } from "../services/voterService";
import { toast } from "react-hot-toast";

const VoterRegistration: React.FC = () => {
  const [formData, setFormData] = useState<VoterRegistrationData>({
    voterId: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    dateOfBirth: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, files } = e.target;
    if (id === "idDocument" && files && files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        [id]: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const result = await voterService.registerVoter(formData);
      
      if (result.success) {
        toast.success(result.message);
        navigate("/voter-verification");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An error occurred during registration");
      console.error("Registration error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-100 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-indigo-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Voter Registration</h2>
          <p className="mt-2 text-gray-600">
            Complete your voter registration by providing the required information
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="voterId" className="block text-sm font-medium text-gray-700">
                Voter ID Number
              </label>
              <input
                id="voterId"
                type="text"
                required
                value={formData.voterId}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your voter ID"
              />
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                Date of Birth
              </label>
              <input
                id="dateOfBirth"
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Street Address
              </label>
              <input
                id="address"
                type="text"
                required
                value={formData.address}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your street address"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                id="city"
                type="text"
                required
                value={formData.city}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your city"
              />
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                State
              </label>
              <input
                id="state"
                type="text"
                required
                value={formData.state}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your state"
              />
            </div>

            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                ZIP Code
              </label>
              <input
                id="zipCode"
                type="text"
                required
                value={formData.zipCode}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your ZIP code"
                pattern="[0-9]{5}"
                title="Five digit ZIP code"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700">ID Document</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="idDocument"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="idDocument"
                      type="file"
                      className="sr-only"
                      onChange={handleChange}
                      accept="image/*,.pdf"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              required
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
              I declare that the information provided is true and accurate
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isSubmitting
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {isSubmitting ? "Registering..." : "Complete Registration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VoterRegistration;