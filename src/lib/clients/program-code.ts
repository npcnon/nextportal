import axios from 'axios';
import apiClient from './authenticated-api-client';

export async function getProgramCodeByCampusId(campusId: number): Promise<string | null> {
  try {
    const response = await apiClient.get(`program/?campus_id=${campusId}`);
    const activeProgram = response.data.results.find((program: {
      is_active: boolean, 
      code: string
    }) => program.is_active);
    
    return activeProgram ? activeProgram.code : null;
  } catch (error) {
    console.error('Error fetching program code:', error);
    return null;
  }
}