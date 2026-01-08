'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

// Rwanda phone number regex (starts with +250, followed by 9 digits)
const RWANDA_PHONE_REGEX = /^\+250\d{9}$/;

export function AuthForm() {
  const [phone, setPhone] = useState('+250');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const { generateRecaptcha, signInWithPhone, verifyOtp } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    generateRecaptcha();
  }, [generateRecaptcha]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Ensure it starts with +250
    if (!value.startsWith('+250')) {
      value = '+250';
    }
    // Allow only digits after the prefix, and limit length
    const numericPart = value.substring(4).replace(/\D/g, '');
    setPhone(`+250${numericPart.substring(0, 9)}`);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (!RWANDA_PHONE_REGEX.test(phone)) {
        toast({
            variant: 'destructive',
            title: 'Invalid Phone Number',
            description: 'Please enter a valid Rwandan phone number (e.g., +250 7XX XXX XXX).',
        });
        setLoading(false);
        return;
    }

    try {
      const confirmationResult = await signInWithPhone(phone);
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
              placeholder="+250 7XX XXX XXX"
              value={phone}
              onChange={handlePhoneChange}
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
