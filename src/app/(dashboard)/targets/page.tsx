'use client';
import { useState } from 'react';
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
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { mockTargets } from '@/lib/data';
import type { Target } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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

export default function TargetsPage() {
  const [targets, setTargets] = useState<Target[]>(mockTargets);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<Partial<Target> | null>(
    null
  );
  const { toast } = useToast();

  const handleOpenDialog = (target?: Target) => {
    setEditingTarget(target || {});
    setIsDialogOpen(true);
  };

  const handleSaveTarget = () => {
    // This is where you would normally save to a database.
    // For now, we just update the mock data.
    if (editingTarget?.id) {
      setTargets(
        targets.map((t) =>
          t.id === editingTarget.id ? (editingTarget as Target) : t
        )
      );
      toast({ title: 'Target Updated', description: 'Your target has been successfully updated.' });
    } else {
      const newTarget: Target = {
        id: `target-${Date.now()}`,
        userId: 'user-1',
        status: 'active',
        leadsFound: 0,
        lastScanned: new Date(),
        createdAt: new Date(),
        ...editingTarget,
      } as Target;
      setTargets([newTarget, ...targets]);
      toast({ title: 'Target Created', description: 'Your new target is now active.' });
    }
    setIsDialogOpen(false);
    setEditingTarget(null);
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
                {targets.map((target) => (
                  <TableRow key={target.id}>
                    <TableCell>
                      <Badge
                        variant={
                          target.status === 'active' ? 'default' : 'secondary'
                        }
                        className={target.status === 'active' ? 'bg-green-600' : ''}
                      >
                        {target.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{target.term}</TableCell>
                    <TableCell>{target.type}</TableCell>
                    <TableCell>{target.platform}</TableCell>
                    <TableCell>{target.leadsFound}</TableCell>
                    <TableCell>
                      {formatDistanceToNow(target.lastScanned, {
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
                          <DropdownMenuItem>Pause</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenDialog(target)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingTarget?.id ? 'Edit Target' : 'Add New Target'}</DialogTitle>
            <DialogDescription>
              {editingTarget?.id
                ? "Update the details of your lead generation target."
                : "Define the criteria for finding new leads."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="term" className="text-right">
                Term
              </Label>
              <Input
                id="term"
                value={editingTarget?.term || ''}
                onChange={(e) => setEditingTarget({...editingTarget, term: e.target.value})}
                className="col-span-3"
                placeholder="e.g. looking for a graphic designer"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="platform" className="text-right">
                Platform
              </Label>
               <Select
                  value={editingTarget?.platform}
                  onValueChange={(value: 'twitter' | 'reddit' | 'linkedin') =>
                    setEditingTarget({ ...editingTarget, platform: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="reddit">Reddit</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                  </SelectContent>
              </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
               <Select
                  value={editingTarget?.type}
                  onValueChange={(value: 'keyword' | 'hashtag' | 'account') =>
                    setEditingTarget({ ...editingTarget, type: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a target type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="keyword">Keyword</SelectItem>
                    <SelectItem value="hashtag">Hashtag</SelectItem>
                    <SelectItem value="account">Account</SelectItem>
                  </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveTarget} className="bg-accent hover:bg-accent/90 text-accent-foreground">Save Target</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
