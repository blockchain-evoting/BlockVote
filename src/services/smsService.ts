// SMS Service for OTP delivery
// This is a mock implementation that can be replaced with a real SMS provider

interface SMSProvider {
  sendSMS(phoneNumber: string, message: string): Promise<boolean>;
}

// Mock SMS Provider (for development)
class MockSMSProvider implements SMSProvider {
  async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    console.log('🔐 MOCK SMS SERVICE');
    console.log(`📱 To: ${phoneNumber}`);
    console.log(`📩 Message: ${message}`);
    
    // Extract OTP from message for easier testing
    const otpMatch = message.match(/\d{6}/);
    if (otpMatch) {
      console.log(`🔑 OTP Code: ${otpMatch[0]}`);
    }
    
    return true;
  }
}

// Twilio SMS Provider (for production)
// Requires Twilio credentials to be set in environment variables
class TwilioSMSProvider implements SMSProvider {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;
  private twilioClient: any;

  constructor() {
    // These would typically come from environment variables
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '';
    
    // Check if Twilio is configured
    if (this.accountSid && this.authToken && this.fromNumber) {
      try {
        // Dynamic import to avoid requiring Twilio package in development
        // this.twilioClient = require('twilio')(this.accountSid, this.authToken);
        console.log('Twilio client initialized');
      } catch (error) {
        console.error('Failed to initialize Twilio client:', error);
      }
    } else {
      console.warn('Twilio credentials not found. SMS will not be sent.');
    }
  }

  async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    // If Twilio is not configured, log a warning and return false
    if (!this.twilioClient) {
      console.warn('Twilio not configured. SMS not sent.');
      return false;
    }

    try {
      // Format the phone number (ensure it has country code)
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      
      // Send the SMS using Twilio
      const result = await this.twilioClient.messages.create({
        body: message,
        from: this.fromNumber,
        to: formattedNumber
      });
      
      console.log(`SMS sent to ${phoneNumber}, SID: ${result.sid}`);
      return true;
    } catch (error) {
      console.error('Failed to send SMS:', error);
      return false;
    }
  }

  private formatPhoneNumber(phoneNumber: string): string {
    // Ensure the phone number has the country code
    if (!phoneNumber.startsWith('+')) {
      // Default to US country code if none provided
      return `+1${phoneNumber}`;
    }
    return phoneNumber;
  }
}

// SMS Service Factory
class SMSService {
  private provider: SMSProvider;
  
  constructor() {
    // Determine which provider to use based on environment
    const useRealSMS = process.env.USE_REAL_SMS === 'true';
    
    if (useRealSMS) {
      this.provider = new TwilioSMSProvider();
    } else {
      this.provider = new MockSMSProvider();
    }
  }
  
  async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    return this.provider.sendSMS(phoneNumber, message);
  }
}

// Export a singleton instance
export const smsService = new SMSService();
