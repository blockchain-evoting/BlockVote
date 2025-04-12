import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, ArrowRight } from 'lucide-react';
import { sendOTP, verifyOTP } from '../utils/otpService';

const TwoFactorAuthPage: React.FC = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const contactNumber = location.state?.contact;

  useEffect(() => {
    if (!contactNumber) {
      navigate('/login');
      return;
    }
    // Send initial OTP
    sendOTP(contactNumber);
  }, [contactNumber, navigate]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0 && isResendDisabled) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setIsResendDisabled(false);
    }
    return () => clearInterval(timer);
  }, [countdown, isResendDisabled]);

  const handleChange = (value: string, index: number) => {
    if (value.length > 1) {
      value = value[0];
    }
    
    if (!/^\d*$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== '' && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const pastedOtp = pastedData.slice(0, 6).split('');
    
    if (!/^\d*$/.test(pastedData)) {
      return;
    }

    const newOtp = [...otp];
    pastedOtp.forEach((value, index) => {
      if (index < 6) {
        newOtp[index] = value;
      }
    });
    setOtp(newOtp);
  };

  const handleResendOTP = async () => {
    if (contactNumber) {
      setError('');
      await sendOTP(contactNumber);
      setCountdown(30);
      setIsResendDisabled(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const otpValue = otp.join('');
    if (otpValue.length === 6 && contactNumber) {
      const isValid = verifyOTP(contactNumber, otpValue);
      if (isValid) {
        navigate('/voter-dashboard');
      } else {
        setError('Invalid OTP. Please try again.');
        setOtp(['', '', '', '', '', '']);
        // Focus first input
        document.getElementById('otp-0')?.focus();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-100 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-indigo-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Two-Factor Authentication</h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a 6-digit code to {contactNumber ? `+${contactNumber}` : 'your phone'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
          
          <div className="flex gap-2 justify-center">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-xl font-semibold border-2 rounded-lg focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            ))}
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Verify OTP
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Didn't receive the code?{' '}
            <button
              onClick={handleResendOTP}
              disabled={isResendDisabled}
              className={`font-medium ${
                isResendDisabled
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-indigo-600 hover:text-indigo-500'
              }`}
            >
              {isResendDisabled ? `Resend in ${countdown}s` : 'Resend OTP'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuthPage;