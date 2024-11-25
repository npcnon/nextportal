// lib/clients/prospectus-client.ts
import axios from 'axios';
import { ProspectusSubject } from '@/types/prospectus';

export const getProspectusSubjects = async (programCode: string): Promise<ProspectusSubject[]> => {
  try {
    const response = await axios.get(
      `https://node-mysql-signup-verification-api.onrender.com/prospectus/external/get-all-prospectus-subjects/?${programCode}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching prospectus subjects:', error);
    return [];
  }
};