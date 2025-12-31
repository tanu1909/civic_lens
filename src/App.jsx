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
            <Route path="/login" element={<AuthPage />} />

            <Route path="/about" element={<About/>}/>
            <Route path="/feedback" element={<Feedback/>}/>

            <Route path="/scan" element={<CameraCapture />} /> {/*(member 2) Added route for the AI Camera Scanner. Accessible via /scan URL */}

          </Routes>
        </main>

        <FooterCard />
      </div>
    </Router>
  );
};

export default App;