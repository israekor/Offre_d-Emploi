// IMPORT THE INSTANCE YOU CREATED, NOT RAW AXIOS
import API from '../axios';

export const getJobs = () => API.get('/jobs').then(r => r.data);
export const getJobById = (id) => API.get(`/jobs/${id}`).then(r => r.data);
export const createJob = (jobData) => API.post('/jobs', jobData).then(r => r.data);
export const deleteJob = (id) => API.delete(`/jobs/${id}`).then(r => r.data);
export const updateJob = (id, data) => API.put(`/jobs/${id}`, data).then(r => r.data);

// Search with filters: keyword, location, jobType
export const searchJobs = (filters) => 
  API.get('/jobs/search', { params: filters }).then(r => r.data);