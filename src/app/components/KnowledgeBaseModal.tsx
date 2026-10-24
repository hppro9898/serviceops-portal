import { useState } from 'react';
import { X, Search, BookOpen } from 'lucide-react';
import { Pagination } from './Pagination';

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface KbArticle {
  id: string;
  title: string;
  date: string;
  author: string;
  authorColor: string;
  status: 'Published' | 'Draft' | 'In Review';
}

const AUTHOR_COLORS: Record<string, string> = {
  Ashish: '#3D8BD0', 'Zoilo Orit': '#9CA3AF', Rosy: '#2563EB', 'Sarah Johnson': '#8B5CF6', 'Michael Chen': '#F59E0B',
};

const KB_ARTICLES: KbArticle[] = [
  { id: 'KB-2', title: 'The Complete Guide to "useradd" Command in Linux', date: 'Thu, May 07, 2020 03:50 PM', author: 'Ashish', authorColor: AUTHOR_COLORS.Ashish, status: 'Published' },
  { id: 'KB-9', title: 'How to log tickets', date: 'Thu, Aug 27, 2020 05:43 PM', author: 'Ashish', authorColor: AUTHOR_COLORS.Ashish, status: 'Published' },
  { id: 'KB-10', title: 'How to Clean Trojan Worm', date: 'Wed, Sep 02, 2020 09:02 AM', author: 'Zoilo Orit', authorColor: AUTHOR_COLORS['Zoilo Orit'], status: 'Published' },
  { id: 'KB-13', title: 'On-boarding Documentation Requirement', date: 'Wed, Sep 09, 2020 03:53 PM', author: 'Ashish', authorColor: AUTHOR_COLORS.Ashish, status: 'Published' },
  { id: 'KB-21', title: 'Windows Disk Cleanup', date: 'Fri, Sep 03, 2021 01:38 PM', author: 'Ashish', authorColor: AUTHOR_COLORS.Ashish, status: 'Published' },
  { id: 'KB-22', title: 'How to reset password', date: 'Fri, Sep 10, 2021 03:08 PM', author: 'Ashish', authorColor: AUTHOR_COLORS.Ashish, status: 'Published' },
  { id: 'KB-27', title: 'How to Fix It When a Lenovo Laptop Camera Is Not Working', date: 'Wed, Dec 01, 2021 07:33 PM', author: 'Ashish', authorColor: AUTHOR_COLORS.Ashish, status: 'Published' },
  { id: 'KB-32', title: 'MSSQL Logs FW', date: 'Thu, May 05, 2022 01:00 PM', author: 'Ashish', authorColor: AUTHOR_COLORS.Ashish, status: 'Published' },
  { id: 'KB-36', title: 'Patch Deployment', date: 'Mon, Jul 11, 2022 05:27 PM', author: 'Rosy', authorColor: AUTHOR_COLORS.Rosy, status: 'Published' },
  { id: 'KB-38', title: 'How to use Patch Management?', date: 'Fri, Jul 22, 2022 05:25 PM', author: 'Ashish', authorColor: AUTHOR_COLORS.Ashish, status: 'Published' },
  { id: 'KB-39', title: 'How to resolve Internet Queries', date: 'Thu, Aug 25, 2022 11:31 AM', author: 'Rosy', authorColor: AUTHOR_COLORS.Rosy, status: 'Published' },
  { id: 'KB-42', title: 'VPN Connectivity Troubleshooting', date: 'Wed, Sep 21, 2022 11:32 AM', author: 'Ashish', authorColor: AUTHOR_COLORS.Ashish, status: 'In Review' },
  { id: 'KB-43', title: 'Email Client Configuration Guide', date: 'Wed, Sep 21, 2022 11:34 AM', author: 'Ashish', authorColor: AUTHOR_COLORS.Ashish, status: 'Draft' },
  { id: 'KB-48', title: 'Travel Allowance or Reimbursement', date: 'Thu, Nov 03, 2022 05:58 PM', author: 'Ashish', authorColor: AUTHOR_COLORS.Ashish, status: 'Published' },
  { id: 'KB-756', title: 'Monitoring Integration Steps', date: 'Mon, Jan 16, 2023 10:12 AM', author: 'Michael Chen', authorColor: AUTHOR_COLORS['Michael Chen'], status: 'Published' },
  { id: 'KB-892', title: 'Observability Best Practices', date: 'Tue, Feb 21, 2023 02:40 PM', author: 'Michael Chen', authorColor: AUTHOR_COLORS['Michael Chen'], status: 'Published' },
  { id: 'KB-1024', title: 'SolarWinds Setup Guide', date: 'Fri, Mar 10, 2023 09:05 AM', author: 'Sarah Johnson', authorColor: AUTHOR_COLORS['Sarah Johnson'], status: 'Published' },
];

const statusStyle = (s: string) =>
  s === 'Published' ? { text: '#16A34A', dot: '#16A34A' }
  : s === 'Draft' ? { text: '#6B7280', dot: '#9CA3AF' }
  : { text: '#D97706', dot: '#F59E0B' };

const initials = (name: string) => name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

export function KnowledgeBaseModal({ isOpen, onClose }: KnowledgeBaseModalProps) {
  const [query, setQuery] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  if (!isOpen) return null;

  const q = query.trim().toLowerCase();
  const rows = q ? KB_ARTICLES.filter((a) => a.title.toLowerCase().includes(q) || a.id.toLowerCase().includes(q) || a.author.toLowerCase().includes(q)) : KB_ARTICLES;

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const curPage = Math.min(page, totalPages);
  const startIdx = total === 0 ? 0 : (curPage - 1) * pageSize;
  const paged = rows.slice(startIdx, startIdx + pageSize);

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-[10000] transition-opacity duration-300" onClick={onClose} />

      <div
        className="fixed top-0 right-0 h-full w-[720px] max-w-[96vw] bg-white shadow-2xl z-[10001] flex flex-col transition-transform duration-300"
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-[#E5E7EB] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center size-9 rounded-lg bg-[#EAF3FB]"><BookOpen size={18} className="text-[#3D8BD0]" /></span>
            <div>
              <h2 className="text-[18px] font-semibold text-[#111827]">Knowledge Base</h2>
              <p className="text-[13px] text-[#6B7280] mt-0.5">All published and draft articles</p>
            </div>
          </div>
          <button onClick={onClose} className="flex size-8 flex-shrink-0 items-center justify-center rounded transition-colors hover:bg-[#F3F4F6] text-[#6B7280] hover:text-[#111827]"><X size={20} /></button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-[#F0F1F3] flex-shrink-0">
          <div className="flex items-center gap-2 h-9 px-3 border border-[#DFE5ED] rounded bg-white">
            <Search size={16} className="text-[#9CA3AF] flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Select field or enter a keyword to search..."
              className="outline-none text-sm bg-transparent placeholder:text-[#9CA3AF] text-[#364658] flex-1 min-w-0"
            />
            {query && <button onClick={() => setQuery('')} className="p-0.5 hover:bg-[#F5F7FA] rounded"><X size={14} className="text-[#7B8FA5]" /></button>}
          </div>
        </div>

        {/* Column headers */}
        <div className="flex items-center px-6 py-2.5 border-b border-[#E5E7EB] flex-shrink-0 text-[12px] font-semibold text-[#6B7280]">
          <div className="flex-1 min-w-0">Name</div>
          <div className="w-[200px] flex-shrink-0">Author</div>
          <div className="w-[120px] flex-shrink-0">Status</div>
        </div>

        {/* Rows */}
        <div className="flex-1 overflow-auto">
          {total === 0 ? (
            <div className="text-center py-16 text-[13px] text-[#7B8FA5]">No articles match your search.</div>
          ) : paged.map((a) => {
            const ss = statusStyle(a.status);
            return (
              <div key={a.id} className="flex items-center px-6 py-3 border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors cursor-pointer">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded bg-[#EBF5FF] px-2 py-0.5 text-[11px] font-semibold text-[#3D8BD0] flex-shrink-0">{a.id}</span>
                    <span className="text-[13px] font-medium text-[#364658] truncate">{a.title}</span>
                  </div>
                  <div className="text-[11px] text-[#3D8BD0] mt-1">{a.date}</div>
                </div>
                <div className="w-[200px] flex-shrink-0 flex items-center gap-2">
                  <span className="size-6 rounded flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0" style={{ backgroundColor: a.authorColor }}>{initials(a.author)}</span>
                  <span className="text-[13px] text-[#364658] truncate">{a.author}</span>
                </div>
                <div className="w-[120px] flex-shrink-0">
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-medium" style={{ color: ss.text }}>
                    <span className="size-1.5 rounded-full" style={{ backgroundColor: ss.dot }} />
                    {a.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer — shared pagination (same as the listing pages) */}
        <div className="flex-shrink-0">
          <Pagination
            currentPage={curPage}
            totalPages={totalPages}
            itemsPerPage={pageSize}
            totalItems={total}
            onPageChange={setPage}
            onItemsPerPageChange={(n) => { setPageSize(n); setPage(1); }}
          />
        </div>
      </div>
    </>
  );
}
