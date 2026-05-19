import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { getExpenses } from '../../APIs/Orders';
import TableComp from '../Table';
import DashboardPagination from './DashboardPagination';

const PAGE_SIZE = 10;

const expensesColumns = [
  { key: 'description', label: 'Description' },
  { key: 'amount', label: 'Amount' },
  { key: 'paidAt', label: 'Spend At' },
  {
    key: 'date',
    label: 'Time',
    format: (value) => (value ? moment(value).format('DD-MM-YYYY hh:mm') : ''),
  },
];

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getExpenses({ page, limit: PAGE_SIZE });
      if (response?.status === 200) {
        const data = response.data;
        setExpenses(data?.items || []);
        setTotalPages(data?.totalPages ?? 1);
        setTotalCount(data?.totalCount ?? 0);
        if (data?.page) setPage(data.page);
      } else {
        window.alert(response);
      }
    } catch (err) {
      window.alert(err?.response?.data?.message || err?.message || 'Failed to load expenses.');
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return (
    <div className="dashboard-panel" style={{ overflowX: 'auto' }}>
      <h4>All expenses</h4>
      {loading && !expenses.length ? (
        <p className="text-muted mb-0">Loading expenses...</p>
      ) : (
        <>
          <TableComp
            data={expenses}
            columns={expensesColumns}
            emptyMessage="No expenses found."
            className="dashboard-table table-borderless"
            style={{ width: '100%', margin: 0 }}
          />
          <DashboardPagination
            page={page}
            totalPages={totalPages}
            totalCount={totalCount}
            disabled={loading}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}

export default Expenses;
