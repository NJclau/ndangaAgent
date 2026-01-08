'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onAuthStateChanged,
  User,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { usePhoneAuth } from './usePhoneAuth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (phone: string, recaptchaToken: string) => Promise<{ success: boolean; message: string; }>;
  signOut: () => Promise<void>;
  verifyCode: (phone: string, code: string) => Promise<{ token: string; userId: string; } | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { sendCode, verifyCode: verifyOtpCode, loading: phoneAuthLoading, error: phoneAuthError } = usePhoneAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async (phone: string, recaptchaToken: string) => {
    return await sendCode(phone, recaptchaToken);
  };

  const verifyCode = async (phone: string, code: string) => {
    const result = await verifyOtpCode(phone, code);
    if (result?.token) {
        // Here you would typically sign in with the custom token
        // For simplicity, we'll rely on the onAuthStateChanged listener to update the user
    }
    return result;
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const isAuthenticated = !!user;

  const value = {
    user,
    loading: loading || phoneAuthLoading,
    isAuthenticated,
    signIn,
    signOut,
    verifyCode,
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
  return context;
};
