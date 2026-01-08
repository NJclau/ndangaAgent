'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function AuthForm() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const { generateRecaptcha, signInWithPhone, verifyOtp } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    generateRecaptcha();
  }, [generateRecaptcha]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const confirmationResult = await signInWithPhone(`+${phone.replace(/\D/g, '')}`);
      window.confirmationResult = confirmationResult;
      setShowOtp(true);
      toast({ title: 'OTP Sent', description: 'Check your phone for the verification code.' });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to send OTP. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyOtp(otp);
      toast({ title: 'Success', description: 'You are now signed in.' });
      router.push('/dashboard');
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Invalid OTP. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!showOtp ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label htmlFor="phone" className="sr-only">Phone Number</label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter phone number with country code"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send OTP
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <label htmlFor="otp" className="sr-only">OTP</label>
            <Input
              id="otp"
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              disabled={loading}
              maxLength={6}
            />
          </div>
          <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify OTP
          </Button>
          <Button variant="link" onClick={() => setShowOtp(false)} className="w-full text-primary">
            Change phone number
          </Button>
        </form>
      )}
    </div>
  );
}
