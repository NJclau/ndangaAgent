'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MoreHorizontal, Loader2 } from 'lucide-react';
import type { Target } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { logTargetAdded } from '@/lib/analytics';

const targetSchema = z.object({
    term: z.string().min(3, "Term must be at least 3 characters.").max(50, "Term must be 50 characters or less."),
    platform: z.enum(['twitter', 'reddit', 'linkedin']),
    type: z.enum(['keyword', 'hashtag', 'account']),
});

export default function TargetsPage() {
  const { user } = useAuth();
  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<Target | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof targetSchema>>({
    resolver: zodResolver(targetSchema),
    defaultValues: {
      term: '',
      platform: 'twitter',
      type: 'keyword'
    }
  });
  
  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const targetsQuery = query(collection(db, 'targets'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(targetsQuery, (snapshot) => {
      const targetsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Target));
      setTargets(targetsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching targets:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch targets.'});
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, toast]);

  const handleOpenDialog = (target?: Target) => {
    setEditingTarget(target || null);
    form.reset(target ? {
        term: target.term,
        platform: target.platform,
        type: target.type
    } : {
      term: '',
      platform: 'twitter',
      type: 'keyword'
    });
    setIsDialogOpen(true);
  };

  const handleSaveTarget = async (values: z.infer<typeof targetSchema>) => {
    if (!user) return;
    
    try {
      if (editingTarget) {
        // Update existing target
        const targetRef = doc(db, 'targets', editingTarget.id);
        await updateDoc(targetRef, {
            ...values,
            lastScanned: serverTimestamp(), // Or keep old
        });
        toast({ title: 'Target Updated', description: 'Your target has been successfully updated.' });
      } else {
        // Create new target
        await addDoc(collection(db, 'targets'), {
            ...values,
            userId: user.uid,
            status: 'active',
            leadsFound: 0,
            lastScanned: serverTimestamp(),
            createdAt: serverTimestamp(),
        });
        logTargetAdded(values.platform, values.type);
        toast({ title: 'Target Created', description: 'Your new target is now active.' });
      }
      setIsDialogOpen(false);
      setEditingTarget(null);
    } catch(error) {
        console.error("Error saving target:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to save target.' });
    }
  };

  const handleDeleteTarget = async (targetId: string) => {
    try {
        await deleteDoc(doc(db, 'targets', targetId));
        toast({ title: 'Target Deleted', description: 'The target has been removed.'});
    } catch (error) {
        console.error("Error deleting target:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete target.' });
    }
  };

  const handleTogglePause = async (target: Target) => {
    try {
        const targetRef = doc(db, 'targets', target.id);
        const newStatus = target.status === 'active' ? 'paused' : 'active';
        await updateDoc(targetRef, { status: newStatus });
        toast({ title: `Target ${newStatus}` });
    } catch (error) {
        console.error("Error updating target status:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to update target status.' });
    }
  };


  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">
              Targets
            </h1>
            <p className="text-muted-foreground">
              Define what kinds of leads you want to find.
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Target
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Your Targets</CardTitle>
            <CardDescription>
              A list of all your active and paused search targets.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Leads Found</TableHead>
                  <TableHead>Last Scanned</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                    <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                           <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                        </TableCell>
                    </TableRow>
                ) : targets.length === 0 ? (
                     <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                            No targets created yet.
                        </TableCell>
                    </TableRow>
                ) : (
                    targets.map((target) => (
                    <TableRow key={target.id}>
                        <TableCell>
                        <Badge
                            variant={
                            target.status === 'active' ? 'default' : 'secondary'
                            }
                            className={target.status === 'active' ? 'bg-green-600 hover:bg-green-700' : ''}
                        >
                            {target.status}
                        </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{target.term}</TableCell>
                        <TableCell className="capitalize">{target.type}</TableCell>
                        <TableCell className="capitalize">{target.platform}</TableCell>
                        <TableCell>{target.leadsFound}</TableCell>
                        <TableCell>
                        {target.lastScanned && formatDistanceToNow(new Date((target.lastScanned as any).seconds * 1000), {
                            addSuffix: true,
                        })}
                        </TableCell>
                        <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="ghost"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDialog(target)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleTogglePause(target)}>
                                {target.status === 'active' ? 'Pause' : 'Resume'}
                            </DropdownMenuItem>
                             <DropdownMenuSeparator />
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                        Delete
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete your target.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteTarget(target.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingTarget ? 'Edit Target' : 'Add New Target'}</DialogTitle>
            <DialogDescription>
              {editingTarget
                ? "Update the details of your lead generation target."
                : "Define the criteria for finding new leads."}
            </DialogDescription>
          </DialogHeader>
           <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSaveTarget)} className="space-y-4">
               <FormField
                    control={form.control}
                    name="term"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Term</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g. looking for a graphic designer" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="platform"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Platform</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                             <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a platform" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="twitter">Twitter</SelectItem>
                                <SelectItem value="reddit">Reddit</SelectItem>
                                <SelectItem value="linkedin">LinkedIn</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a target type" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="keyword">Keyword</SelectItem>
                                <SelectItem value="hashtag">Hashtag</SelectItem>
                                <SelectItem value="account">Account</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Target
                    </Button>
                </DialogFooter>
            </form>
           </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
