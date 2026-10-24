import { useState, useEffect } from 'react';
import { Pagination } from './Pagination';

/**
 * Drops pagination onto any existing grid without restructuring it.
 *
 * Renders `children(pageRows)` and, BELOW it, the shared pager — but only when the data actually
 * overflows a page. With small datasets nothing appears, so a 3-row table stays clean; the pager
 * shows up automatically once a real customer's data grows past the page size.
 *
 * It is a component (not a hook) on purpose: most of these grids live inside conditionally
 * rendered IIFEs — `{activeMainTab === 'x' && (() => { … })()}` — where calling hooks directly
 * would break the rules of hooks. Holding the state in here keeps that legal.
 *
 *   <Paginated rows={processes}>
 *     {(pageRows) => <table>…{pageRows.map(…)}…</table>}
 *   </Paginated>
 */
interface PaginatedProps<T> {
  rows: T[];
  /** Rows per page (default 20). */
  perPage?: number;
  /** Pin the pager to the bottom of the scroll viewport. */
  sticky?: boolean;
  /** Negative margins so a sticky pager can span its container's padding, e.g. "-mx-6 -mb-6". */
  bleed?: string;
  children: (pageRows: T[]) => React.ReactNode;
}

export function Paginated<T>({ rows, perPage = 20, sticky = false, bleed = '', children }: PaginatedProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(perPage);

  // Snap back to page 1 whenever the result set or page size changes (filters, search, etc.).
  useEffect(() => { setCurrentPage(1); }, [rows.length, itemsPerPage]);

  const totalPages = Math.ceil(rows.length / itemsPerPage) || 1;
  const page = Math.min(currentPage, totalPages); // guards against a stale out-of-range page
  const pageRows = rows.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const overflows = rows.length > itemsPerPage;

  return (
    <>
      {children(overflows ? pageRows : rows)}
      {overflows && (
        <div className={`${sticky ? 'sticky bottom-0 z-30' : ''} bg-white ${bleed}`}>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={rows.length}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(v) => { setItemsPerPage(v); setCurrentPage(1); }}
          />
        </div>
      )}
    </>
  );
}
