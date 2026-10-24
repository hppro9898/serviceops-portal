import { X, FileText, Download } from 'lucide-react';

interface AttachmentPreviewModalProps {
  attachment: { name: string; size?: string } | null;
  onClose: () => void;
}

// Centered preview popup for an attachment — renders an image preview for image
// files and a document-page preview otherwise (self-contained inline SVG, since
// this prototype has no real uploaded files).
export function AttachmentPreviewModal({ attachment, onClose }: AttachmentPreviewModalProps) {
  if (!attachment) return null;
  const ext = (attachment.name?.split('.').pop() || '').toLowerCase();
  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'].includes(ext);

  return (
    <div className="fixed inset-0 z-[10005] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-[640px] max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-[#E5E7EB] flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <FileText size={16} className="text-[#7B8FA5] flex-shrink-0" />
            <span className="text-[14px] font-semibold text-[#364658] truncate" title={attachment.name}>{attachment.name}</span>
            {attachment.size && <span className="text-[12px] text-[#7B8FA5] flex-shrink-0">{attachment.size}</span>}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button className="p-1.5 rounded hover:bg-[#EBF5FF] transition-colors" title="Download">
              <Download size={16} className="text-[#3D8BD0]" />
            </button>
            <button onClick={onClose} className="p-1.5 rounded hover:bg-[#F1F5F9] transition-colors" title="Close">
              <X size={18} className="text-[#6B7280]" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto bg-[#F1F5F9] flex items-center justify-center p-6">
          {isImage ? (
            <svg viewBox="0 0 640 420" className="w-full h-auto max-w-[560px] rounded-lg border border-[#E2E8F0] shadow-sm">
              <defs>
                <linearGradient id="attModalSky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#DBEAFE" />
                  <stop offset="100%" stopColor="#EFF6FF" />
                </linearGradient>
              </defs>
              <rect width="640" height="420" fill="url(#attModalSky)" />
              <circle cx="500" cy="100" r="44" fill="#FBBF24" />
              <path d="M0 420 L170 210 L300 330 L430 170 L640 300 L640 420 Z" fill="#86C7A8" />
              <path d="M0 420 L210 280 L400 380 L640 250 L640 420 Z" fill="#5FAE93" />
            </svg>
          ) : (
            <svg viewBox="0 0 520 660" className="h-auto max-h-[60vh] rounded-lg border border-[#E2E8F0] bg-white shadow-sm">
              <rect width="520" height="660" fill="#FFFFFF" />
              <rect x="40" y="44" width="240" height="22" rx="4" fill="#94A3B8" />
              {Array.from({ length: 15 }).map((_, i) => (
                <rect key={i} x="40" y={92 + i * 34} width={i % 4 === 3 ? 180 : 440} height="12" rx="3" fill="#E2E8F0" />
              ))}
            </svg>
          )}
        </div>

        {/* Footer caption */}
        <div className="px-5 py-2.5 border-t border-[#E5E7EB] text-[12px] text-[#7B8FA5] flex-shrink-0">
          {isImage ? 'Image preview' : 'Document preview'}
        </div>
      </div>
    </div>
  );
}
