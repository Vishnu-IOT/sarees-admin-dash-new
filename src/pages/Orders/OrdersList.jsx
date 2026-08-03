import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../components/Topbar.jsx';
import Badge from '../../components/Badge.jsx';
import Pagination from '../../components/Pagination.jsx';
import { Loader, EmptyState } from '../../components/Loader.jsx';
import { ordersApi } from '../../api/orders';
import { useToast } from '../../context/ToastContext.jsx';
import { formatCurrency, formatDate } from '../../utils/format';
import { IconOrders } from '../../components/icons.jsx';

const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];
const PAYMENT_OPTIONS = ['Pending', 'Paid', 'Failed', 'Refunded'];

export default function OrdersList() {
  const toast = useToast();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (status) params.status = status;
      if (paymentStatus) params.paymentStatus = paymentStatus;
      const res = await ordersApi.list(params);
      setRows(res.data);
      setPagination({
        total: res.totalOrders,
        pages: res.totalPages,
        currentPage: res.currentPage,
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, status, paymentStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const filtered = rows.filter((o) => {
    if (!search) return true;
    const s = search.toLowerCase();
    const customer = o.User ? `${o.User.name}` : '';
    return o.orderNumber.toLowerCase().includes(s) || customer.toLowerCase().includes(s);
  });

  return (
    <>
      <Topbar eyebrow="Sales" title="Orders" search={search} onSearchChange={setSearch} searchPlaceholder="Search order # or customer…" />
      <div className="page">
        <div className="page-header">
          <div>
            <h2>All orders</h2>
            <p>{pagination?.total ?? 0} orders placed</p>
          </div>
        </div>

        <div className="table-wrap">
          <div className="table-toolbar">
            <div className="table-toolbar-filters">
              <select className="filter-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
                <option value="">All statuses</option>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select className="filter-select" value={paymentStatus} onChange={(e) => { setPaymentStatus(e.target.value); setPage(1); }}>
                <option value="">All payment statuses</option>
                {PAYMENT_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <Loader />
          ) : filtered.length === 0 ? (
            <EmptyState icon={IconOrders} title="No orders found" message="Orders placed by customers will appear here." />
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => (
                    <tr key={o.id} className="clickable" onClick={() => navigate(`/orders/${o.id}`)}>
                      <td className="cell-mono cell-primary">{o.orderNumber}</td>
                      <td>{o.customer ? `${o.customer.name} ` : '—'}</td>
                      <td className="cell-muted">{formatDate(o.createdAt)}</td>
                      <td className="cell-muted">{o.totalItems ?? 0}</td>
                      <td className="cell-primary">{formatCurrency(o.grandTotal)}</td>
                      <td><Badge value={o.paymentStatus} /></td>
                      <td><Badge value={o.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      </div>
    </>
  );
}
