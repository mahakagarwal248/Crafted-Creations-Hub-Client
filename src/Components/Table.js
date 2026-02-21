import Table from 'react-bootstrap/Table';

/**
 * Dynamic table component that works with any data and column config.
 *
 * @param {Object} props
 * @param {Array} props.data - Array of row objects
 * @param {Array<{key: string, label: string, format?: (value: any, row: object) => any}>} props.columns - Column config: key = data field, label = header text, format = optional formatter(value, fullRow)
 * @param {string} [props.keyField] - Field to use as row key (default: index)
 * @param {string} [props.emptyMessage] - Message when data is empty
 * @param {string} [props.className] - Optional table className
 * @param {object} [props.style] - Optional table style
 */
function TableComp({ data, columns = [], keyField, emptyMessage = 'No data to display.', className = '', style = { width: '80%', margin: 'auto' } }) {
  if (!columns.length) {
    return null;
  }

  return (
    <Table responsive className={className} style={style}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data && data.length > 0 ? (
          data.map((item, index) => (
            <tr key={keyField && item[keyField] != null ? item[keyField] : index}>
              {columns.map((col) => {
                const value = item[col.key];
                const display = typeof col.format === 'function' ? col.format(value, item) : value;
                return <td key={col.key}>{display}</td>;
              })}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={columns.length} style={{ textAlign: 'center' }}>
              {emptyMessage}
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}

export default TableComp;
