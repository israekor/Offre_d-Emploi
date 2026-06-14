import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Jobs from './pages/Jobs';
import UploadCV from './pages/UploadCV';
import MyApplication from './pages/MyApplication';
import './index.css'
import RecruiterDashboard from './pages/RecruiterDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path='/jobs' element={<Jobs/>} />
        <Route path='/recruiter-dashboard' element={<RecruiterDashboard/>} />
        <Route path='/upload-cv' element={<UploadCV />} />
        <Route path='/uploadcv' element={<UploadCV />} />
        <Route path='/my-applications' element={<MyApplication />} />
        <Route path='/myapplication' element={<MyApplication />} />
      </Routes>
    </BrowserRouter>
  );
}