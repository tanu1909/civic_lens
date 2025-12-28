import React, { useState, useEffect } from 'react';
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // This checks if a user is already signed in
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div>
      {/* Logic: If user is logged in, show Dashboard. If not, show Login. */}
      {user ? <Dashboard /> : <Login />}
    </div>
  );
}

export default App;