import Button from 'react-bootstrap/Button';

function DashboardPagination({ page, totalPages, totalCount, onPageChange, disabled }) {
  if (totalPages <= 1 && totalCount <= 0) return null;

  return (
    <div className="dashboard-pagination">
      <Button
        type="button"
        size="sm"
        variant="outline-secondary"
        className="btn-dashboard-ghost"
        disabled={disabled || page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </Button>
      <span className="dashboard-pagination-info">
        Page {page} of {Math.max(totalPages, 1)}
        {totalCount != null ? ` · ${totalCount} total` : ''}
      </span>
      <Button
        type="button"
        size="sm"
        variant="outline-secondary"
        className="btn-dashboard-ghost"
        disabled={disabled || page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </div>
  );
}

export default DashboardPagination;
