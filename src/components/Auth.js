import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import SignUpForm from './SignUpForm';

const Auth = ({ setUser }) => {
  const [showSignUp, setShowSignUp] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      console.log('User signed in with Google successfully');
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setError(error.message);
    }
  };

  const handleSignOut = async () => {
    setError('');
    try {
      await signOut(auth);
      setUser(null);
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      setError(error.message);
    }
  };

  return (
    <div>
      {auth.currentUser ? (
        <div>
          <p>Welcome, {auth.currentUser.displayName}</p>
          <button onClick={handleSignOut}>Sign Out</button>
        </div>
      ) : (
        <div>
          {showSignUp ? (
            <SignUpForm setUser={setUser} setShowSignUp={setShowSignUp} />
          ) : (
            <div>
              <button onClick={handleGoogleSignIn}>Sign In with Google</button>
              <button onClick={() => setShowSignUp(true)}>Create Account</button>
              {error && <p style={{ color: 'red' }}>{error}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Auth;