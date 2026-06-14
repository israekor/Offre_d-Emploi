import API from '../axios';

export const getMyCV = () => API.get('/cv/my-cv').then(r => r.data);

export const uploadCV = (formData) => API.post('/cv', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
}).then(r => r.data);
