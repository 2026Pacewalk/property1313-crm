import { CheckCheck, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessagePreviewProps {
  message: string;
  mediaType?: string;
  mediaUrl?: string;
  status?: 'sent' | 'delivered' | 'read' | 'failed';
  className?: string;
  compact?: boolean;
}

export default function MessagePreview({ message, mediaType, mediaUrl, status = 'sent', className, compact }: MessagePreviewProps) {
  const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div className={cn('flex justify-start', className)}>
      <div className="max-w-[85%] md:max-w-[70%]">
        {/* WhatsApp bubble */}
        <div className="bg-[#DCF8C6] rounded-lg rounded-tl-none px-3 py-2 relative">
          {/* Media preview */}
          {mediaType === 'image' && mediaUrl && (
            <div className="mb-2 rounded-md overflow-hidden">
              <img src={mediaUrl} alt="Media" className="w-full h-32 object-cover" />
            </div>
          )}
          {mediaType === 'pdf' && (
            <div className="mb-2 bg-white/80 rounded-md p-2 flex items-center gap-2">
              <div className="w-8 h-10 bg-red-500 rounded flex items-center justify-center text-white text-[10px] font-bold">PDF</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">Brochure.pdf</p>
                <p className="text-[10px] text-neutral-500">2.4 MB</p>
              </div>
            </div>
          )}
          {mediaType === 'video' && (
            <div className="mb-2 rounded-md overflow-hidden bg-neutral-800 h-32 flex items-center justify-center relative">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <div className="w-0 h-0 border-l-[14px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1" />
              </div>
              <p className="absolute bottom-1 right-2 text-[10px] text-white/80">2:34</p>
            </div>
          )}
          {mediaType === 'link' && (
            <div className="mb-2 bg-white/60 rounded-md p-2 text-xs text-blue-600 underline break-all">
              {mediaUrl || 'https://p1313.com/project/...'}
            </div>
          )}

          {/* Message text */}
          <p className={cn('text-neutral-800 whitespace-pre-wrap leading-relaxed', compact ? 'text-[13px]' : 'text-sm')}>
            {message.split(/(\{\{\w+\}\})/g).map((part, i) => {
              if (part.match(/\{\{\w+\}\}/)) {
                return <span key={i} className="bg-p13-yellow/40 px-1 rounded text-xs font-medium">{part}</span>;
              }
              return part;
            })}
          </p>

          {/* Time + Status */}
          <div className="flex items-center justify-end gap-1 mt-1">
            <span className="text-[10px] text-neutral-500">{time}</span>
            {status === 'sent' && <Clock size={compact ? 10 : 12} className="text-neutral-400" />}
            {status === 'delivered' && <CheckCheck size={compact ? 10 : 12} className="text-neutral-400" />}
            {status === 'read' && <CheckCheck size={compact ? 10 : 12} className="text-blue-500" />}
            {status === 'failed' && <span className="text-[10px] text-red-500">Failed</span>}
          </div>

          {/* Triangle */}
          <div className="absolute -left-2 top-0 w-0 h-0 border-l-[8px] border-l-transparent border-t-[8px] border-t-[#DCF8C6]" />
        </div>
      </div>
    </div>
  );
}
