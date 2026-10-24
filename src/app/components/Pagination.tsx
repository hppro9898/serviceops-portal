import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

const PER_PAGE_OPTIONS = [10, 20, 25, 50, 100];

/**
 * Build the page list with ellipses so the control stays compact no matter how many pages exist:
 * always shows the first and last page plus a window around the current one.
 *   1 2 3 4 5 … 40   |   1 … 18 19 20 … 40   |   1 … 36 37 38 39 40
 */
function buildPages(current: number, total: number): (number | 'gap-left' | 'gap-right')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, 'gap-right', total];
  if (current >= total - 3) return [1, 'gap-left', total - 4, total - 3, total - 2, total - 1, total];
  return [1, 'gap-left', current - 1, current, current + 1, 'gap-right', total];
}

export function Pagination({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
}: PaginationProps) {
  // 10 or fewer items never need paging — hide the whole bar (product rule: pagination
  // appears only when there are MORE than 10 items, i.e. the smallest page size).
  if (totalItems <= 10) return null;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const pages = buildPages(currentPage, totalPages);

  const arrowBtn =
    'flex h-8 w-8 items-center justify-center rounded-md border border-[#DFE5ED] bg-white text-[#64748B] transition-colors hover:bg-[#F3F4F6] hover:text-[#364658] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#64748B]';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e5e7eb] bg-white px-6 py-2.5">
      {/* Result range */}
      <span className="text-[12px] text-[#64748B] tabular-nums">
        {totalItems === 0 ? (
          'No results'
        ) : (
          <>
            Showing <span className="font-medium text-[#364658]">{startItem}–{endItem}</span> of{' '}
            <span className="font-medium text-[#364658]">{totalItems}</span>
          </>
        )}
      </span>

      <div className="flex items-center gap-4">
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[#64748B] whitespace-nowrap">Rows per page</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="app-select h-8 cursor-pointer rounded border border-[#DFE5ED] bg-white pl-2.5 text-[12px] font-medium text-[#364658] transition-colors hover:bg-[#F9FAFB] focus:border-[#3D8BD0] focus:outline-none focus:ring-1 focus:ring-[#3D8BD0]"
          >
            {PER_PAGE_OPTIONS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        {/* Page controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            title="Previous page"
            className={arrowBtn}
          >
            <ChevronLeft size={16} />
          </button>

          {pages.map((p) =>
            typeof p === 'number' ? (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                aria-current={currentPage === p ? 'page' : undefined}
                className={`flex h-8 min-w-8 items-center justify-center rounded px-2 text-[12px] tabular-nums transition-colors ${
                  currentPage === p
                    ? 'bg-[#EBF5FF] font-semibold text-[#3D8BD0]'
                    : 'font-medium text-[#64748B] hover:bg-[#F3F4F6] hover:text-[#364658]'
                }`}
              >
                {p}
              </button>
            ) : (
              <span key={p} className="flex h-8 w-6 items-end justify-center pb-1.5 text-[12px] text-[#9CA3AF] select-none">
                …
              </span>
            )
          )}

          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            title="Next page"
            className={arrowBtn}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
