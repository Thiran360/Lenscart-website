import React from 'react';
import './Pagination.css';

/**
 * Reusable Pagination Component
 * 
 * Props:
 * @param {number} totalItems - Total number of items
 * @param {number} itemsPerPage - Items displayed per page
 * @param {number} totalPages - Explicit total pages (if server-side paginated)
 * @param {number} currentPage - Current active page (1-indexed)
 * @param {function} onPageChange - Callback when page changes: (pageNumber) => void
 * @param {boolean} forceShow - Show pagination even if only 1 page
 * @param {boolean} scrollToTop - Auto scroll to top of content on page change (default: true)
 */
function Pagination({
  totalItems,
  itemsPerPage = 1,
  totalPages: totalPagesProp,
  currentPage = 1,
  onPageChange,
  forceShow = false,
  scrollToTop = true
}) {
  const computedTotalPages = Math.max(1, Math.ceil((totalItems || 0) / (itemsPerPage || 1)));
  const totalPages = totalPagesProp != null ? Number(totalPagesProp) : computedTotalPages;

  // Don't render if only 1 page (total_pages <= 1) or 0 items
  if (totalPages <= 1) return null;

  const handlePageClick = (page) => {
    if (page === currentPage || page < 1 || page > totalPages) return;
    
    onPageChange(page);

    if (scrollToTop) {
      // Smoothly scroll to top of the dashboard content area or top of page
      setTimeout(() => {
        const targetElement = 
          document.querySelector('.dashboard-content') || 
          document.querySelector('.dashboard-container') || 
          document.querySelector('.address-manager-wrapper') ||
          document.querySelector('.container');

        if (targetElement) {
          const yOffset = -90; // offset to account for sticky navbar
          const y = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 50);
    }
  };

  /**
   * Generate page numbers with ellipsis for large page counts.
   * Shows: first, last, current, and 1 sibling on each side.
   */
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // max page buttons to show (excluding ellipsis)

    if (totalPages <= maxVisible + 2) {
      // Show all pages if total is small enough
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      if (start > 2) {
        pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="pagination-container">
      {/* Previous Button */}
      <button
        className="pagination-btn pagination-nav"
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span className="pagination-nav-text">Prev</span>
      </button>

      {/* Page Numbers */}
      <div className="pagination-pages">
        {pageNumbers.map((page, index) =>
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="pagination-ellipsis">
              •••
            </span>
          ) : (
            <button
              key={page}
              className={`pagination-btn pagination-page ${currentPage === page ? 'active' : ''}`}
              onClick={() => handlePageClick(page)}
              aria-label={`Page ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          )
        )}
      </div>

      {/* Next Button */}
      <button
        className="pagination-btn pagination-nav"
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <span className="pagination-nav-text">Next</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}

export default Pagination;
