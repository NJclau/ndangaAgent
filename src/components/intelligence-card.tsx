'use client';

import { useState, useRef, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useDocument } from '@/hooks/use-document';
import type { Lead } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Twitter, Linkedin, Copy, Check, Loader2, AlertTriangle } from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { logLeadContacted, logLeadDismissed } from '@/lib/analytics';

const platformDetails = {
  twitter: {
    icon: <svg role="img" viewBox="0 0 24 24" className="h-5 w-5 fill-current"><title>X</title><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>,
    color: 'bg-black',
  },
  reddit: {
    icon: <svg role="img" viewBox="0 0 24 24" className="h-5 w-5 fill-current"><title>Reddit</title><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0Zm5.445 15.355c-1.125 1.125-3.11 1.5-5.445 1.5s-4.32-.375-5.445-1.5c-.33-.33-.81-.345-1.14-.03a.811.811 0 0 0-.03 1.14c1.5 1.5 3.915 2.01 6.615 2.01s5.115-.51 6.615-2.01a.812.812 0 0 0-.03-1.14.807.807 0 0 0-1.14.03Zm-.29-4.59a1.65 1.65 0 0 1-1.65-1.65c0-.915.735-1.65 1.65-1.65s1.65.735 1.65 1.65c0 .915-.735 1.65-1.65 1.65Zm-6.9 0a1.65 1.65 0 0 1-1.65-1.65c0-.915.735-1.65 1.65-1.65s1.65.735 1.65 1.65c0 .915-.735 1.65-1.65 1.65ZM12 4.14c.66 0 1.2.54 1.2 1.2s-.54 1.2-1.2 1.2-1.2-.54-1.2-1.2.54-1.2 1.2-1.2Zm0 0"/></svg>,
    color: 'bg-orange-500',
  },
  linkedin: {
    icon: <Linkedin className="h-5 w-5" />,
    color: 'bg-sky-700',
  },
};

export function IntelligenceCard({ leadId }: { leadId: string }) {
  const { data: lead, loading, error } = useDocument<Lead>(`leads/${leadId}`);
  const [isExpanded, setIsExpanded] = useState(false);
  const [draftReply, setDraftReply] = useState(lead?.draftReply || '');
  const [isCopied, setIsCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (lead?.draftReply) {
      setDraftReply(lead.draftReply);
    }
  }, [lead?.draftReply]);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [draftReply]);

  const updateLeadStatus = async (status: 'ignored' | 'replied') => {
    try {
      const leadRef = doc(db, 'leads', leadId);
      await updateDoc(leadRef, { status });
      if (status === 'ignored') {
        logLeadDismissed(leadId, lead!.confidence);
      } else {
        logLeadContacted(leadId, lead!.confidence, lead!.platform);
      }
      toast({
        title: `Lead ${status}`,
        description: `The lead has been moved to the '${status}' list.`,
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: 'Could not update the lead status. Please try again.',
      });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draftReply).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  if (loading) {
    return (
        <Card className="space-y-4 p-6 animate-pulse">
            <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-muted"></div>
                <div className="space-y-2">
                    <div className="h-4 w-32 rounded bg-muted"></div>
                    <div className="h-3 w-24 rounded bg-muted"></div>
                </div>
            </div>
            <div className="space-y-2">
                <div className="h-4 w-full rounded bg-muted"></div>
                <div className="h-4 w-5/6 rounded bg-muted"></div>
            </div>
        </Card>
    );
  }

  if (error || !lead) {
    return (
        <Card className="p-6 flex flex-col items-center justify-center text-destructive">
            <AlertTriangle className="h-8 w-8 mb-2"/>
            <p className="font-semibold">Error loading lead</p>
            <p className="text-sm">{error?.message || 'Lead data could not be found.'}</p>
        </Card>
    );
  }

  const confidenceScore = Math.round(lead.confidence * 100);
  const confidenceColor =
    confidenceScore >= 80 ? 'bg-green-500 text-green-50' :
    confidenceScore >= 50 ? 'bg-yellow-400 text-yellow-900' :
    'bg-red-500 text-red-50';

  const platform = platformDetails[lead.platform];
  const whatsappText = encodeURIComponent(`Regarding your post: "${lead.text}"\n\n${draftReply}`);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
                <span className={`flex h-full w-full items-center justify-center rounded-full text-white ${platform.color}`}>
                    {platform.icon}
                </span>
            </Avatar>
            <div>
              <CardTitle className="text-sm font-semibold">{lead.author}</CardTitle>
              <CardDescription className="text-xs">{lead.authorHandle}</CardDescription>
            </div>
          </div>
          <div className='flex flex-col items-end gap-1'>
            <Badge className={confidenceColor}>{confidenceScore}%</Badge>
            <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(lead.timestamp), { addSuffix: true })}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p
          className={`text-sm text-foreground/90 ${!isExpanded && 'line-clamp-3'}`}
          onClick={() => setIsExpanded(!isExpanded)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setIsExpanded(!isExpanded)}
        >
          {lead.text}
        </p>

        <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-3">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-800">Isoko Intelligence</p>
          <p className="mt-1 text-sm text-blue-900">{lead.reason}</p>
        </div>

        <div className="relative mt-4">
          <Textarea
            ref={textareaRef}
            value={draftReply}
            onChange={(e) => setDraftReply(e.target.value)}
            placeholder="Draft your reply..."
            className="pr-10"
            maxLength={500}
            rows={1}
          />
          <div className="absolute bottom-2 right-2 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{draftReply.length}/500</span>
            <Button size="icon" variant="ghost" onClick={handleCopy} aria-label="Copy reply">
              {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end gap-2">
        <Button variant="secondary" onClick={() => updateLeadStatus('ignored')} aria-label="Dismiss lead">Dismiss</Button>
        <Button 
            asChild 
            style={{ backgroundColor: '#25D366', color: 'white' }}
            className='hover:bg-[#1EAE54]'
            onClick={() => updateLeadStatus('replied')}
        >
            <a href={`whatsapp://send?text=${whatsappText}`} target="_blank" rel="noopener noreferrer">
                Reply via WhatsApp
            </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
