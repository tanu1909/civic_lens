import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./services/firebase.js"; 

import Home from './pages/Home';
import Navbar from './components/Navbar';
import FooterCard from './components/FooterCard';
import AuthPage from './pages/AuthPage';
import About from './pages/About.jsx';
import Feedback from './pages/Feedback.jsx';

import CameraCapture from './components/CameraCapture';// ai scanner imported(member 2)
import UserHistory from './pages/UserHistory';//(by mem-2)
import AdminFeedback from './pages/AdminFeedback.jsx';

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe(); 
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen w-full overflow-hidden">
        {/* Pass the user state to the Navbar */}
        <Navbar user={user} />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            
            {/*  If user is already logged in, redirect them away from the login page */}
            <Route 
              path="/login" 
              element={!user ? <AuthPage /> : <Navigate to="/" replace />} 
            />

            <Route path="/about" element={<About/>}/>
            <Route path="/feedback" element={<Feedback/>}/>

            {/* Protected Route: Redirects to login if not authenticated */}
            <Route 
              path="/scan" 
              element={user ? <CameraCapture user={user} /> : <Navigate to="/login" state={{ from: '/scan' }} replace />} 
            />
            <Route path="/history" element={<UserHistory />} />{/*by mem-2 */}

            <Route path="/admin/feedback" element={<AdminFeedback />} />
          </Routes>
        </main>

        <FooterCard />
      </div>
    </Router>
  );
};

export default App;