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
  const user = null; // Bypassing auth
  const loading = false; // Bypassing auth

  const generateRecaptcha = () => {};
  const signInWithPhone = (phone: string) => Promise.resolve();
  const verifyOtp = (otp: string) => Promise.resolve();

  return (
    <AuthContext.Provider value={{ user: user as any, loading, generateRecaptcha, verifyOtp, signInWithPhone }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  // Always return a mock user when bypassing auth
  return {
    user: mockUser as any,
    loading: false,
    generateRecaptcha: () => {},
    verifyOtp: (otp: string) => Promise.resolve(),
    signInWithPhone: (phone: string) => Promise.resolve(),
  };
};
