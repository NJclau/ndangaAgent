
import { useDocument } from '@/hooks/useDocument';
import { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface Lead {
  id: string;
  platform: 'instagram' | 'twitter';
  authorHandle: string;
  timestamp: { toDate: () => Date };
  confidence: number;
  text: string;
  reason: string;
  draftReply: string;
  status: string;
}

interface IntelligenceCardProps {
  leadId: string;
}

const platformColors = {
  instagram: 'bg-pink-500',
  twitter: 'bg-blue-500',
};

const confidenceColors = {
  high: 'bg-green-500',
  medium: 'bg-yellow-500',
  low: 'bg-red-500',
};

export const IntelligenceCard = ({ leadId }: IntelligenceCardProps) => {
  const { data: lead, loading, error } = useDocument<Lead>(`leads/${leadId}`);
  const [isExpanded, setIsExpanded] = useState(false);
  const [draft, setDraft] = useState(lead?.draftReply || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [draft]);

  useEffect(() => {
    setDraft(lead?.draftReply || '');
  }, [lead]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!lead) return null;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return confidenceColors.high;
    if (confidence >= 50) return confidenceColors.medium;
    return confidenceColors.low;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
  };

  // This function is a placeholder for the actual cloud function call
  const updateLeadStatus = (status: string) => {
    console.log(`Updating lead ${leadId} to ${status}`);
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 max-w-md mx-auto my-4">
      {/* Header */}
      <div className="flex items-center mb-4">
        <div className={`w-10 h-10 rounded-full ${platformColors[lead.platform]} mr-3`}></div>
        <div>
          <p className="text-sm font-semibold">{lead.authorHandle}</p>
          <p className="text-xs text-gray-400">
            {formatDistanceToNow(lead.timestamp.toDate(), { addSuffix: true })}
          </p>
        </div>
        <div className={`ml-auto px-2 py-1 text-xs text-white rounded-full ${getConfidenceColor(lead.confidence)}`}>
          {lead.confidence}%
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className={`${isExpanded ? '' : 'line-clamp-3'} cursor-pointer`} onClick={() => setIsExpanded(!isExpanded)}>
          {lead.text}
        </p>
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mt-4">
          <p className="uppercase text-xs font-semibold text-blue-900">Isoko Intelligence</p>
          <p className="text-sm text-blue-900 mt-1">{lead.reason}</p>
        </div>
        <div className="mt-4">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full p-2 border rounded-md resize-none overflow-hidden"
            maxLength={500}
          />
          <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
            <span>{draft.length} / 500</span>
            <button onClick={handleCopy} className="font-semibold hover:text-blue-600">Copy</button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end space-x-2">
        <button onClick={() => updateLeadStatus('dismissed')} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Dismiss</button>
        <a href={`https://wa.me/?text=${encodeURIComponent(draft)}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600" style={{backgroundColor: '#25D366'}}>WhatsApp</a>
      </div>
    </div>
  );
};
