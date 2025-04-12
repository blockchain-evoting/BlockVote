// In-memory storage for OTPs (in production, use a proper database)
const otpStore: { [key: string]: { otp: string; expiry: number } } = {};

export const generateOTP = (length: number = 6): string => {
    return Math.floor(Math.random() * Math.pow(10, length))
        .toString()
        .padStart(length, '0');
};

export const storeOTP = (phoneNumber: string, otp: string) => {
    // OTP expires in 5 minutes
    const expiry = Date.now() + 5 * 60 * 1000;
    otpStore[phoneNumber] = { otp, expiry };
};

export const verifyOTP = (phoneNumber: string, otp: string): boolean => {
    const storedData = otpStore[phoneNumber];
    if (!storedData) return false;

    const isValid = storedData.otp === otp && Date.now() < storedData.expiry;
    if (isValid) {
        // Clear OTP after successful verification
        delete otpStore[phoneNumber];
    }
    return isValid;
};

export const sendSMS = async (phoneNumber: string, message: string) => {
    // TODO: Integrate with an actual SMS service (Twilio, MessageBird, etc.)
    // For now, just log the message
    console.log(`Sending SMS to ${phoneNumber}: ${message}`);
    return true;
};

export const sendOTP = async (phoneNumber: string): Promise<boolean> => {
    const otp = generateOTP();
    storeOTP(phoneNumber, otp);
    
    const message = `Your E-Voting verification code is: ${otp}. Valid for 5 minutes.`;
    return await sendSMS(phoneNumber, message);
};
