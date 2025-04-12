import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, AlertTriangle, Camera } from 'lucide-react';

const VoterVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationData, setVerificationData] = useState({
    idNumber: '',
    phoneNumber: '',
    otp: '',
  });
  const [selfieImage, setSelfieImage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVerificationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelfieCapture = () => {
    // In a real implementation, this would use the device camera
    // For now, we'll simulate with a file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'user';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          setSelfieImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleRequestOTP = async () => {
    setIsVerifying(true);
    try {
      // TODO: Integrate with verification service
      // await verificationService.sendOTP(verificationData.phoneNumber);
      
      // Simulate OTP sending
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStep(2);
    } catch (error) {
      console.error('Error sending OTP:', error);
      // Handle error appropriately
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyOTP = async () => {
    setIsVerifying(true);
    try {
      // TODO: Integrate with verification service
      // await verificationService.verifyOTP(verificationData.otp);
      
      // Simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStep(3);
    } catch (error) {
      console.error('Error verifying OTP:', error);
      // Handle error appropriately
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFinalVerification = async () => {
    setIsVerifying(true);
    try {
      // TODO: Integrate with blockchain service
      // await blockchainService.verifyVoter({
      //   ...verificationData,
      //   selfieImage,
      // });
      
      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      navigate('/voter-dashboard', {
        state: { message: 'Verification completed successfully!' }
      });
    } catch (error) {
      console.error('Error verifying voter:', error);
      // Handle error appropriately
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Voter Verification</h1>
          <p className="text-gray-600 mt-2">Complete verification to access voting</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Step indicators */}
          <div className="flex justify-between mb-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 
                  ${step >= i
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-300 text-gray-400'
                  }`}
              >
                {i}
              </div>
            ))}
          </div>

          {/* Step 1: ID Verification */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Number
                </label>
                <input
                  type="text"
                  name="idNumber"
                  value={verificationData.idNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={verificationData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <button
                onClick={handleRequestOTP}
                disabled={isVerifying || !verificationData.idNumber || !verificationData.phoneNumber}
                className={`w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700
                  ${(isVerifying || !verificationData.idNumber || !verificationData.phoneNumber)
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                  }`}
              >
                {isVerifying ? 'Sending OTP...' : 'Request OTP'}
              </button>
            </div>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter OTP
                </label>
                <input
                  type="text"
                  name="otp"
                  value={verificationData.otp}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter 6-digit OTP"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  OTP sent to {verificationData.phoneNumber}
                </p>
              </div>
              <button
                onClick={handleVerifyOTP}
                disabled={isVerifying || verificationData.otp.length !== 6}
                className={`w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700
                  ${(isVerifying || verificationData.otp.length !== 6)
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                  }`}
              >
                {isVerifying ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
          )}

          {/* Step 3: Selfie Verification */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mb-4">
                  {selfieImage ? (
                    <img
                      src={selfieImage}
                      alt="Selfie preview"
                      className="w-48 h-48 rounded-full object-cover mx-auto"
                    />
                  ) : (
                    <div className="w-48 h-48 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                      <Camera className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSelfieCapture}
                  className="mb-4 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {selfieImage ? 'Retake Selfie' : 'Take Selfie'}
                </button>
              </div>
              <button
                onClick={handleFinalVerification}
                disabled={isVerifying || !selfieImage}
                className={`w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700
                  ${(isVerifying || !selfieImage) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isVerifying ? 'Verifying...' : 'Complete Verification'}
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-800"
          >
            Cancel Verification
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoterVerificationPage;
