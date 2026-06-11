import API from '../axios'; 

export const login = (data) => API.post('/auth/signin', data).then(r => r.data);
export const register = (data) => API.post('/auth/signup', data).then(r => r.data);
export const logout = (data = {}) => API.post('/auth/signout', data).then(r => r.data);
