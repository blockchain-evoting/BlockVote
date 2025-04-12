import axios from 'axios';

export interface VoterRegistrationData {
  voterId: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  dateOfBirth: string;
  idDocument?: File;
}

class VoterService {
  private baseUrl = 'http://localhost:3001/api';

  async registerVoter(data: VoterRegistrationData): Promise<{ success: boolean; message: string }> {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      });

      await axios.post(`${this.baseUrl}/voters/register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        message: 'Voter registration successful',
      };
    } catch (error) {
      console.error('Error registering voter:', error);
      return {
        success: false,
        message: 'Failed to register voter. Please try again.',
      };
    }
  }

  async verifyVoter(voterId: string): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/voters/verify/${voterId}`);
      return response.data.verified;
    } catch (error) {
      console.error('Error verifying voter:', error);
      return false;
    }
  }
}

export const voterService = new VoterService();
