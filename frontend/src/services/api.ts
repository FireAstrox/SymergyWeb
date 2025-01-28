import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const getGridStatus = async () => {
  const response = await axios.get(`${API_URL}/api/status`);
  return response.data;
};
