import API from '../axios';

export const applyJob = (data) => API.post('/applications', data).then(r => r.data);

export const getMyApplications = () => API.get('/applications').then(r => r.data);

export const updateApplicationStatus = (id, status) => API.put(`/applications/${id}`, { status }).then(r => r.data);
