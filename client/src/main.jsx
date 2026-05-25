import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CustomerPage from './pages/CustomerPage';
import TechnicianPage from './pages/TechnicianPage';
import TrackPage from './pages/TrackPage';
import Nav from './components/Nav';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<CustomerPage />} />
        <Route path="/tech" element={<TechnicianPage />} />
        <Route path="/track/:requestId" element={<TrackPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
