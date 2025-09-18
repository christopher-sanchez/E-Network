import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import './App.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Header from './components/Header';

function App() {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);
// functions to check if user is logged in
  useEffect(() => {
    const listen = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setLoading(false);
    });

    return () => {
      listen();
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>; 
  }
//Routing to the login or register page
  return (
    <Routes>
      <Route 
        path="/login" 
        element={!authUser ? <Login /> : <Navigate to="/" />} 
      />
      <Route 
        path="/register" 
        element={!authUser ? <Register /> : <Navigate to="/" />} 
      />
      <Route 
        path="/" 
        element={
          authUser ? (
            <>
              <Header />
              <Home />
            </>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route path="*" element={<Navigate to={authUser ? "/" : "/login"} />} />
    </Routes>
  );
}

export default App;
