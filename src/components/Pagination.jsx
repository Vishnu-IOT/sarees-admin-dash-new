import React from 'react';
import { IconChevronLeft, IconChevronRight } from './icons.jsx';

// pagination = { total, pages, currentPage } exactly as returned by the
// backend's findAndCountAll helpers.
export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.pages <= 1) return null;
  const { total, pages, currentPage } = pagination;

  const pageNumbers = [];
  const windowSize = 1;
  for (let p = 1; p <= pages; p++) {
    if (p === 1 || p === pages || Math.abs(p - currentPage) <= windowSize) {
      pageNumbers.push(p);
    } else if (pageNumbers[pageNumbers.length - 1] !== '…') {
      pageNumbers.push('…');
    }
  }

  return (
    <div className="pagination">
      <span>{total} total</span>
      <div className="pagination-controls">
        <button disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)} aria-label="Previous page">
          <IconChevronLeft />
        </button>
        {pageNumbers.map((p, i) =>
          p === '…' ? (
            <span key={`e${i}`} style={{ padding: '0 4px', color: 'var(--text-faint)' }}>…</span>
          ) : (
            <button
              key={p}
              className={p === currentPage ? 'active' : ''}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          )
        )}
        <button disabled={currentPage >= pages} onClick={() => onPageChange(currentPage + 1)} aria-label="Next page">
          <IconChevronRight />
        </button>
      </div>
    </div>
  );
}
