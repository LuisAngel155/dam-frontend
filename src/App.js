import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
import UploadForm from './components/UploadForm';
import AssetGallery from './components/AssetGallery';

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Digital Asset Management System</h1>
        </header>
        <main>
          <Routes>
            <Route
              path="/"
              element={!user ? <Auth setUser={setUser} /> : <Navigate to="/gallery" />}
            />
            <Route
              path="/gallery"
              element={user ? (
                <div>
                  <UploadForm />
                  <AssetGallery />
                </div>
              ) : (
                <Navigate to="/" />
              )}
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;