import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import {
  fetchOrderInvoicePdfBlobUrl,
  generateOrderInvoice,
  getOrderInvoice,
} from '../../APIs/invoiceApi';
import './InvoicePrint.css';

function InvoiceDocument({ snapshot }) {
  const rows = snapshot.lineItems?.length ? snapshot.lineItems : [];

  return (
    <div className="invoice-print-sheet">
      <header className="invoice-print-header">
        <h1 className="invoice-print-brand">{snapshot.businessName}</h1>
        <p className="invoice-print-tagline">{snapshot.tagline}</p>
        <p className="invoice-print-contact">Email: {snapshot.email}</p>
        <p className="invoice-print-contact">Phone: {snapshot.phone}</p>
        <hr className="invoice-print-rule" />
      </header>

      <section className="invoice-print-meta">
        <h2 className="invoice-print-title">INVOICE</h2>
        <div className="invoice-print-meta-row">
          <span>
            <strong>Invoice No.:</strong> {snapshot.invoiceNumber}
          </span>
          <span>
            <strong>Date:</strong> {snapshot.date}
          </span>
        </div>
        {snapshot.orderId != null && (
          <div className="invoice-print-meta-row">
            <span>
              <strong>Order ID:</strong> #{snapshot.orderId}
            </span>
          </div>
        )}
      </section>

      <section className="invoice-print-billto">
        <h3>Bill To:</h3>
        <p>Customer Name: {snapshot.billTo?.name}</p>
        <p>Phone Number: {snapshot.billTo?.phone}</p>
        <p>Address: {snapshot.billTo?.address}</p>
      </section>

      <table className="invoice-print-table">
        <thead>
          <tr>
            <th>Item Description</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, index) => (
              <tr key={index}>
                <td>{row.description}</td>
                <td>{row.qty}</td>
                <td>{row.price}</td>
                <td>{row.amount}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', color: '#666' }}>
                No items
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <section className="invoice-print-totals">
        <p>
          <em>
            <strong>Total Amount:</strong>
          </em>{' '}
          ₹{snapshot.totalAmount}
        </p>
        <p>Payment Mode: {snapshot.paymentMode}</p>
        <p>Payment Status: {snapshot.paymentStatus}</p>
      </section>

      <section className="invoice-print-notes">
        <h3>Notes:</h3>
        <ul>
          {(snapshot.notes || []).map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>

      <footer className="invoice-print-signature">
        <p>
          <strong>Authorized Signature</strong>
        </p>
        <div className="invoice-print-signature-line" />
      </footer>
    </div>
  );
}

function InvoicePrint() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const loadInvoice = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getOrderInvoice(orderId);
      if (response?.status === 200 && response.data?.data) {
        setInvoice(response.data.data);
      } else {
        setInvoice(null);
      }
    } catch (err) {
      if (err?.response?.status === 404) {
        setInvoice(null);
      } else {
        setError(err?.response?.data?.message || err?.message || 'Failed to load invoice.');
      }
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadInvoice();
  }, [loadInvoice]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const response = await generateOrderInvoice(orderId);
      if (response?.status === 201 && response.data?.data) {
        setInvoice(response.data.data);
      } else if (response?.status === 409 && response.data?.data) {
        setInvoice(response.data.data);
      } else {
        window.alert(response?.data?.message || 'Could not generate invoice.');
      }
    } catch (err) {
      if (err?.response?.status === 409 && err?.response?.data?.data) {
        setInvoice(err.response.data.data);
      } else {
        window.alert(err?.response?.data?.message || err?.message || 'Failed to generate invoice.');
      }
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const snapshot = invoice?.snapshot;

  return (
    <div className="catalogue-page dashboard-page invoice-print-page">
      <div className="invoice-print-toolbar no-print">
        <Button variant="outline-secondary" size="sm" onClick={() => navigate('/dashboard')}>
          Back to dashboard
        </Button>
        {snapshot && (
          <>
            <Button variant="primary" size="sm" onClick={handlePrint}>
              Print / Save as PDF
            </Button>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={async () => {
                try {
                  const blobUrl = await fetchOrderInvoicePdfBlobUrl(orderId);
                  window.open(blobUrl, '_blank', 'noopener,noreferrer');
                } catch (err) {
                  window.alert(err?.response?.data?.message || err?.message || 'Could not open PDF.');
                }
              }}
            >
              Open stored PDF
            </Button>
          </>
        )}
        {!snapshot && !loading && (
          <Button variant="success" size="sm" onClick={handleGenerate} disabled={generating}>
            {generating ? 'Generating...' : 'Generate invoice'}
          </Button>
        )}
      </div>

      {loading && <p className="invoice-print-status no-print">Loading invoice...</p>}
      {error && <p className="invoice-print-error no-print">{error}</p>}

      {!loading && snapshot && <InvoiceDocument snapshot={snapshot} />}
      {!loading && !snapshot && !error && (
        <p className="invoice-print-status no-print">No invoice yet. Generate one to preview and print.</p>
      )}
    </div>
  );
}

export default InvoicePrint;
