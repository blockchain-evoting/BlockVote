import React, { useState, ChangeEvent, FormEvent } from 'react';
import { AlertCircle, Check, Eye, ArrowLeft, Lock, User, Phone, Book, School } from 'lucide-react';
import { api } from '../services/api';

interface VoterFormData {
  studentId: string;
  name: string;
  department: string;
  contact: string;
  password: string;
}

interface InputFieldProps {
  icon: React.ComponentType<any>;
  name: keyof VoterFormData;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  required?: boolean;
  pattern?: string;
  minLength?: number;
}

const AddVoterForm: React.FC = () => {
  const [formData, setFormData] = useState<VoterFormData>({
    studentId: '',
    name: '',
    department: '',
    contact: '',
    password: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
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

  const InputField: React.FC<InputFieldProps> = ({ 
    icon: Icon, 
    name, 
    label, 
    type = 'text', 
    placeholder, 
    value, 
    onChange, 
    required = true, 
    pattern, 
    minLength 
  }) => (
    <div className="relative">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative rounded-lg shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        {type === 'password' ? (
          <div className="flex">
            <input
              type={showPassword ? 'text' : 'password'}
              id={name}
              name={name}
              required={required}
              value={value}
              onChange={onChange}
              className="block w-full rounded-lg pl-10 pr-10 py-3 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              placeholder={placeholder}
              pattern={pattern}
              minLength={minLength}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
        ) : type === 'select' ? (
          <div className="relative">
            <select
              id={name}
              name={name}
              required={required}
              value={value}
              onChange={onChange}
              className="block w-full rounded-lg pl-10 pr-10 py-3 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 appearance-none transition-all"
            >
              <option value="">Select {label.toLowerCase()}</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        ) : (
          <input
            type={type}
            id={name}
            name={name}
            required={required}
            value={value}
            onChange={onChange}
            className="block w-full rounded-lg pl-10 py-3 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            placeholder={placeholder}
            pattern={pattern}
            minLength={minLength}
          />
        )}
      </div>
    </div>
  );

  if (showPreview) {
    return (
      <div className="w-4/5 mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-4 px-6">
          <h2 className="text-xl font-bold text-white">Preview Voter Details</h2>
          <p className="text-indigo-100 text-sm">
            Please review the information before confirming
          </p>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Student ID</div>
              <div className="text-lg font-medium">{formData.studentId}</div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Full Name</div>
              <div className="text-lg font-medium">{formData.name}</div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Department</div>
              <div className="text-lg font-medium">{formData.department}</div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Contact Number</div>
              <div className="text-lg font-medium">{formData.contact}</div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Password</div>
              <div className="text-lg font-medium">••••••••</div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              type="button"
              onClick={handleBack}
              className="flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Edit
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={`flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                loading
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering...
                </>
              ) : (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Confirm Registration
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
          <div className="w-4/5 mx-uto mx-5 bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-4 px-6">
        <h2 className="text-xl font-bold text-white">Add New Voter</h2>
        <p className="text-indigo-100 text-sm">
          Register a student for the upcoming elections
        </p>
      </div>
      
      <div className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-start">
            <Check className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 grid grid-cols-2 items-start justify-center gap-3">
          <InputField 
            icon={User}
            name="studentId"
            label="Student ID"
            placeholder="Enter student ID"
            value={formData.studentId}
            onChange={handleChange}
          />

          <InputField 
            icon={User}
            name="name"
            label="Full Name"
            placeholder="Enter full name"
            value={formData.name}
            onChange={handleChange}
          />

          <InputField 
            icon={Book}
            name="department"
            label="Department"
            type="select"
            value={formData.department}
            onChange={handleChange}
          />

          <InputField 
            icon={Phone}
            name="contact"
            label="Contact Number"
            type="tel"
            placeholder="Enter 10-digit contact number"
            pattern="[0-9]{10}"
            value={formData.contact}
            onChange={handleChange}
          />

          <InputField 
            icon={Lock}
            name="password"
            label="Password"
            type="password"
            placeholder="Enter password (min 8 characters)"
            minLength={8}
            value={formData.password}
            onChange={handleChange}
          />
          
          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
            >
              <Eye className="h-5 w-5 mr-2" />
              Preview Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVoterForm;