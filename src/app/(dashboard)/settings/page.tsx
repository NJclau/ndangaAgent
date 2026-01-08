'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useDocument } from '@/hooks/use-document';
import type { UserProfile } from '@/lib/types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const settingsSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }).optional(),
  businessName: z.string().optional(),
  businessCategory: z.string().optional(),
  keywords: z.string().optional(),
});

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { data: userProfile, loading: profileLoading } = useDocument<UserProfile>(user ? `users/${user.uid}` : '');
  const { toast } = useToast();

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        name: userProfile.name || '',
        businessName: userProfile.businessName || '',
        businessCategory: userProfile.businessCategory || '',
        keywords: userProfile.keywords?.join(', ') || '',
      });
    }
  }, [userProfile, form]);

  async function onSubmit(values: z.infer<typeof settingsSchema>) {
    if (!user) return;
    
    const keywordsArray = values.keywords?.split(',').map(k => k.trim()).filter(Boolean) || [];

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name: values.name,
        businessName: values.businessName,
        businessCategory: values.businessCategory,
        keywords: keywordsArray,
      });

      toast({
        title: 'Settings Saved',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error) {
      console.error("Failed to update settings:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not save your settings. Please try again.',
      });
    }
  }

  if (authLoading || profileLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and targeting preferences.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal and business information.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Company" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="businessCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Category</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., SaaS, E-commerce, Marketing Agency" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Keywords</FormLabel>
                    <FormControl>
                      <Input placeholder="crm, sales, marketing" {...field} />
                    </FormControl>
                    <FormDescription>
                      Comma-separated keywords that describe what you sell. These help the AI generate better replies.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
