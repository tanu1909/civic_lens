import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./services/firebase.js"; 

import Home from './pages/Home';
import Navbar from './components/Navbar';
import FooterCard from './components/FooterCard';
import AuthPage from './pages/AuthPage';

import About from './pages/About.jsx';
import Feedback from './pages/Feedback.jsx';

import CameraCapture from './components/CameraCapture';// ai scanner imported(member 2)


import AdminDashboard from './pages/AdminDashboard';

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Listen for authentication changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe(); 
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen w-full overflow-hidden">
       
        <Navbar user={user} />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
<<<<<<< Updated upstream
            <Route path="/login" element={<AuthPage />} />
=======
            
            {/* If user is already logged in, redirect them away from the login page */}
            <Route 
              path="/login" 
              element={!user ? <AuthPage /> : <Navigate to="/" replace />} 
            />
>>>>>>> Stashed changes

            <Route path="/about" element={<About/>}/>
            <Route path="/feedback" element={<Feedback/>}/>

<<<<<<< Updated upstream
            <Route path="/scan" element={<CameraCapture />} /> {/*(member 2) Added route for the AI Camera Scanner. Accessible via /scan URL */}
=======
            {/* Protected Route: Redirects to login if not authenticated */}
            <Route 
              path="/scan" 
              element={user ? <CameraCapture user={user} /> : <Navigate to="/login" state={{ from: '/scan' }} replace />} 
            />

            {/* Existing Admin Route */}
            <Route path="/admin/feedback" element={<AdminFeedback />} />

            {/* --- YOUR NEW ROUTE --- */}
            {/* Access this by going to http://localhost:5173/admin */}
            <Route path="/admin" element={<AdminDashboard />} />
>>>>>>> Stashed changes

          </Routes>
        </main>

        <FooterCard />
      </div>
    </Router>
  );
};

export default App;