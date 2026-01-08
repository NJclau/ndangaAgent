'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onAuthStateChanged,
  User,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  browserLocalPersistence,
  setPersistence,
  connectAuthEmulator,
  ConfirmationResult,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { mockUser } from '@/lib/data';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  generateRecaptcha: () => void;
  verifyOtp: (otp: string) => Promise<any>;
  signInWithPhone: (phone: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);


  const generateRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
  };

  const signInWithPhone = (phone: string) => {
    const appVerifier = window.recaptchaVerifier;
    return signInWithPhoneNumber(auth, phone, appVerifier);
  };
  
  const verifyOtp = (otp: string) => {
    const confirmationResult = window.confirmationResult as ConfirmationResult;
    return confirmationResult.confirm(otp);
  }

  const value = {
    user: mockUser as any, // Keep mock user for now to bypass login
    loading: false, // Keep false to bypass loading screen
    generateRecaptcha,
    signInWithPhone,
    verifyOtp,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  // Always return a mock user when bypassing auth
  return {
    user: mockUser as any,
    loading: false,
    generateRecaptcha: () => {},
    verifyOtp: (otp: string) => Promise.resolve(),
    signInWithPhone: (phone: string) => Promise.resolve(),
  };
};
