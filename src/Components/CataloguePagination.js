function CataloguePagination({ page, totalPages, totalCount, onPageChange, disabled }) {
  if (totalPages <= 1) return null;

  return (
    <nav className="catalogue-pagination" aria-label="Catalogue pagination">
      <button
        type="button"
        className="catalogue-pagination-btn"
        disabled={disabled || page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </button>
      <span className="catalogue-pagination-info">
        Page {page} of {Math.max(totalPages, 1)}
        {totalCount != null ? ` · ${totalCount} products` : ''}
      </span>
      <button
        type="button"
        className="catalogue-pagination-btn"
        disabled={disabled || page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </nav>
  );
}

export default CataloguePagination;
