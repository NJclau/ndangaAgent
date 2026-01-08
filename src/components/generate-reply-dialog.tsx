'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Lead } from '@/lib/types';
import { generateReply } from '@/ai/flows/automated-reply-generation';
import { Loader2, Copy, Check } from 'lucide-react';

interface GenerateReplyDialogProps {
  lead: Lead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GenerateReplyDialog({ lead, open, onOpenChange }: GenerateReplyDialogProps) {
  const [instructions, setInstructions] = useState('');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setLoading(true);
    setDraft('');
    try {
      const result = await generateReply({
        leadContent: lead.text,
        confidenceScore: lead.confidence,
        userInstructions: instructions,
      });
      setDraft(result.draftReply);
    } catch (error) {
      console.error('Failed to generate reply:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Could not generate a reply. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generate AI Reply</DialogTitle>
          <DialogDescription>
            Provide some instructions for the AI to tailor the response for this specific lead.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            placeholder="e.g., Mention our upcoming webinar. Keep it casual and friendly."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={3}
          />
          <Button onClick={handleGenerate} disabled={loading} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Draft
          </Button>

          {draft && (
            <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                    <h4 className="font-medium text-lg">Generated Draft</h4>
                    <Button variant="ghost" size="icon" onClick={handleCopy}>
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>
              <div className="rounded-md border bg-muted p-4 text-sm whitespace-pre-wrap">
                {draft}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
