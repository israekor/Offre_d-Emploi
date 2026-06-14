import API from '../axios';

export const getRecruiterDashboard = () =>
  API.get('/dashboard/recruiter').then(r => r.data);

export const getApplicationsForRecruiter = (jobId, status, sort = 'newest') => {
  const params = {};
  if (jobId) params.jobId = jobId;
  if (status) params.status = status;
  if (sort) params.sort = sort;
  return API.get('/dashboard/recruiter/applications', { params }).then(r => r.data);
};

export const getJobApplicationStats = (jobId) =>
  API.get(`/dashboard/recruiter/jobs/${jobId}/stats`).then(r => r.data);

export const getCandidateProfile = (candidateId) =>
  API.get(`/dashboard/recruiter/candidates/${candidateId}`).then(r => r.data);

export const updateApplicationStatus = (applicationId, status) =>
  API.patch(`/dashboard/recruiter/applications/${applicationId}/status`, { status }).then(r => r.data);
