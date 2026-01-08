'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { Lead } from '@/lib/types';
import { Twitter, Linkedin, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const GenerateReplyDialog = dynamic(() =>
  import('./generate-reply-dialog').then((mod) => mod.GenerateReplyDialog)
);

interface LeadCardProps {
  lead: Lead;
}

const platformIcons = {
  twitter: <svg role="img" viewBox="0 0 24 24" className="h-4 w-4 fill-current"><title>X</title><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>,
  reddit: <svg role="img" viewBox="0 0 24 24" className="h-4 w-4 fill-current"><title>Reddit</title><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0Zm5.445 15.355c-1.125 1.125-3.11 1.5-5.445 1.5s-4.32-.375-5.445-1.5c-.33-.33-.81-.345-1.14-.03a.811.811 0 0 0-.03 1.14c1.5 1.5 3.915 2.01 6.615 2.01s5.115-.51 6.615-2.01a.812.812 0 0 0-.03-1.14.807.807 0 0 0-1.14.03Zm-.29-4.59a1.65 1.65 0 0 1-1.65-1.65c0-.915.735-1.65 1.65-1.65s1.65.735 1.65 1.65c0 .915-.735 1.65-1.65 1.65Zm-6.9 0a1.65 1.65 0 0 1-1.65-1.65c0-.915.735-1.65 1.65-1.65s1.65.735 1.65 1.65c0 .915-.735 1.65-1.65 1.65ZM12 4.14c.66 0 1.2.54 1.2 1.2s-.54 1.2-1.2 1.2-1.2-.54-1.2-1.2.54-1.2 1.2-1.2Zm0 0"/></svg>,
  linkedin: <Linkedin className="h-4 w-4" />,
};

export function LeadCard({ lead }: LeadCardProps) {
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const confidenceColor = lead.confidence > 0.8 ? 'bg-green-500' : lead.confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {platformIcons[lead.platform]}
                {lead.author}
                <span className="text-sm font-normal text-muted-foreground">{lead.authorHandle}</span>
              </CardTitle>
              <CardDescription>{formatDistanceToNow(new Date(lead.timestamp), { addSuffix: true })}</CardDescription>
            </div>
             <div className="flex items-center gap-2">
                 {lead.tags?.map(tag => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                 ))}
             </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-foreground/90">{lead.text}</p>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-muted-foreground">Confidence</span>
              <span className="text-sm font-bold text-primary">{Math.round(lead.confidence * 100)}%</span>
            </div>
            <Progress value={lead.confidence * 100} indicatorClassName={confidenceColor} />
            <p className="text-xs text-muted-foreground mt-1">{lead.reason}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          {lead.status === 'pending' && (
            <>
              <Button variant="outline">Ignore</Button>
              <Button variant="outline" onClick={() => setShowReplyDialog(true)}>Generate Reply</Button>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">Reply</Button>
            </>
          )}
          {lead.status === 'replied' && <p className="text-sm text-muted-foreground">You replied to this lead.</p>}
          {lead.status === 'ignored' && <p className="text-sm text-muted-foreground">You ignored this lead.</p>}
        </CardFooter>
      </Card>
      {showReplyDialog && <GenerateReplyDialog lead={lead} open={showReplyDialog} onOpenChange={setShowReplyDialog} />}
    </>
  );
}
