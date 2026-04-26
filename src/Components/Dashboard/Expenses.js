import moment from 'moment';
import { useEffect, useState } from 'react';
import { getExpenses } from '../../APIs/Orders';
import TableComp from '../Table';

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

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    const response = await getExpenses();
    if (response && response.status === 200) setExpenses(response.data || []);
    else window.alert(response);
  };

  return (
    <div className="dashboard-panel" style={{ overflowX: 'auto' }}>
      <h4>All expenses</h4>
      <TableComp
        data={expenses}
        columns={expensesColumns}
        emptyMessage="No expenses found."
        className="dashboard-table table-borderless"
        style={{ width: '100%', margin: 0 }}
      />
    </div>
  );
}

export default Expenses;
