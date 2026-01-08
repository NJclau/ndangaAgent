'use client';

import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase/config';

const sendOTPFunction = httpsCallable(functions, 'sendOTP');
const verifyOTPFunction = httpsCallable(functions, 'verifyOTP');

export const usePhoneAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendCode = async (phone: string, recaptchaToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await sendOTPFunction({ phone, recaptchaToken });
      return result.data as { success: boolean; message: string };
    } catch (err: any) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (phone: string, code: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await verifyOTPFunction({ phone, code });
      return result.data as { token: string; userId: string };
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { sendCode, verifyCode, loading, error };
};