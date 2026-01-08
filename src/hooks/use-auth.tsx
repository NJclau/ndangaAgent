"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const generateRecaptcha = () => {
    // This effect should only run on the client side.
    if (typeof window !== 'undefined') {
        try {
          if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(
              auth,
              "recaptcha-container",
              {
                size: "invisible",
                callback: (response: any) => {
                  // reCAPTCHA solved, allow signInWithPhoneNumber.
                },
              }
            );
          }
        } catch (error) {
          console.error("Error generating reCAPTCHA", error);
        }
    }
  };

  const signInWithPhone = (phone: string) => {
    const appVerifier = window.recaptchaVerifier;
    return signInWithPhoneNumber(auth, phone, appVerifier);
  };
  
  const verifyOtp = (otp: string) => {
    if (window.confirmationResult) {
      return window.confirmationResult.confirm(otp);
    }
    return Promise.reject("No confirmation result available.");
  };
  

  return (
    <AuthContext.Provider value={{ user, loading, generateRecaptcha, verifyOtp, signInWithPhone }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
