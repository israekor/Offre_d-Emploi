import API from '../axios';

// Get candidate dashboard with all stats and applications
export const getCandidateDashboard = () => 
  API.get('/dashboard/candidate').then(r => r.data);

// Get applications filtered by status
export const getApplicationsByStatus = (status) => 
  API.get('/dashboard/candidate/status', { params: { status } }).then(r => r.data);
