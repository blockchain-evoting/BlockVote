import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, ArrowRight, AlertCircle } from 'lucide-react';
import { sendOTP, verifyOTP } from '../utils/otpService';
import { authService } from '../services/authService';

const TwoFactorAuthPage: React.FC = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentOtp, setSentOtp] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const contactNumber = location.state?.contact || authService.getContactNumber();

  useEffect(() => {
    // Check if we have contact information, either from location state or from authService
    if (!contactNumber) {
      console.error('No contact number available for OTP');
      navigate('/login');
      return;
    }
    
    // Send initial OTP
    const sendInitialOtp = async () => {
      setLoading(true);
      try {
        await sendOTP(contactNumber);
        setSentOtp(true);
        console.log(`OTP sent to ${contactNumber}`);
      } catch (err) {
        console.error('Failed to send OTP:', err);
        setError('Failed to send verification code. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    sendInitialOtp();
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
      setLoading(true);
      try {
        await sendOTP(contactNumber);
        setSentOtp(true);
        setCountdown(30);
        setIsResendDisabled(true);
        console.log(`OTP resent to ${contactNumber}`);
      } catch (err) {
        console.error('Failed to resend OTP:', err);
        setError('Failed to resend verification code. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const otpValue = otp.join('');
    if (otpValue.length === 6 && contactNumber) {
      try {
        // For demo purposes, accept any 6-digit code
        const isValid = process.env.NODE_ENV === 'development' ? true : verifyOTP(contactNumber, otpValue);
        
        if (isValid) {
          console.log('OTP verification successful');
          navigate('/voter-dashboard');
        } else {
          setError('Invalid verification code. Please try again.');
          setOtp(['', '', '', '', '', '']);
        }
      } catch (err) {
        console.error('OTP verification error:', err);
        setError('Verification failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-100 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
            <Shield className="h-6 w-6 text-indigo-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Two-Factor Authentication
          </h2>
          {contactNumber ? (
            <p className="mt-2 text-center text-sm text-gray-600">
              {sentOtp ? (
                <>We've sent a verification code to {contactNumber}</>
              ) : (
                <>Sending verification code to {contactNumber}...</>
              )}
            </p>
          ) : (
            <p className="mt-2 text-center text-sm text-red-600 flex items-center justify-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              Contact information missing. Please log in again.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}
          
          {loading && (
            <div className="text-center py-2">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent align-[-0.125em]"></div>
              <p className="mt-2 text-sm text-gray-600">{sentOtp ? 'Verifying...' : 'Sending verification code...'}</p>
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
              disabled={loading || !contactNumber || otp.join('').length !== 6}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${loading || !contactNumber || otp.join('').length !== 6
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                }`}
            >
              {loading ? 'Verifying...' : 'Verify'}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Didn't receive the code?{' '}
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={isResendDisabled || loading || !contactNumber}
              className={`w-full py-2 px-4 text-sm font-medium rounded-md ${isResendDisabled || loading || !contactNumber
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-indigo-600 hover:text-indigo-500'
                }`}
            >
              {isResendDisabled
                ? `Resend code in ${countdown}s`
                : 'Resend verification code'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuthPage;