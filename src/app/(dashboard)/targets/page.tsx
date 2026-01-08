'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { mockTargets } from '@/lib/data';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';

export default function TargetsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">Targets</h1>
            <p className="text-muted-foreground">Define what kinds of leads you want to find.</p>
        </div>
        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Target
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Targets</CardTitle>
          <CardDescription>A list of all your active and paused search targets.</CardDescription>
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
              {mockTargets.map((target) => (
                <TableRow key={target.id}>
                  <TableCell>
                    <Badge variant={target.status === 'active' ? 'default' : 'secondary'} className={target.status === 'active' ? "bg-green-600" : ""}>
                      {target.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{target.term}</TableCell>
                  <TableCell>{target.type}</TableCell>
                  <TableCell>{target.platform}</TableCell>
                  <TableCell>{target.leadsFound}</TableCell>
                  <TableCell>{formatDistanceToNow(target.lastScanned, { addSuffix: true })}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Pause</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
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
  );
}
