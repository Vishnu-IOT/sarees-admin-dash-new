import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Topbar from '../../components/Topbar.jsx';
import Badge from '../../components/Badge.jsx';
import OrderStepper from '../../components/OrderStepper.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import { Loader } from '../../components/Loader.jsx';
import { ordersApi } from '../../api/orders';
import { useToast } from '../../context/ToastContext.jsx';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { IconChevronLeft, IconTrash } from '../../components/icons.jsx';

const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];
const PAYMENT_OPTIONS = ['Pending', 'Paid', 'Failed', 'Refunded'];
const PAYMENT_METHOD_OPTIONS = ["WhatsApp", "COD", "Online"];

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState('');
  const [savingTracking, setSavingTracking] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ordersApi.get(id);
      setOrder(res.data);
      setTracking(res.data.trackingNumber || '');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const handleStatus = async (status) => {
    try {
      await ordersApi.updateStatus(id, status);
      toast.success('Order status updated');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleOrderUpdate = async (field, value) => {
    try {
      const payload = {
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        [field]: value,
      };

      await ordersApi.updateStatus(id, payload);

      setOrder((prev) => ({
        ...prev,
        [field]: value,
      }));

      toast.success("Order updated");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handlePaymentStatus = async (paymentStatus) => {
    try {
      await ordersApi.updatePaymentStatus(id, paymentStatus);
      toast.success('Payment status updated');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleTrackingSave = async () => {
    setSavingTracking(true);
    try {
      await ordersApi.updateTracking(id, tracking);
      toast.success('Tracking number saved');
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingTracking(false);
    }
  };

  const handleDelete = async () => {
    await ordersApi.remove(id).then(() => {
      toast.success('Order deleted');
      navigate('/orders');
    }).catch((err) => toast.error(err.message));
  };

  if (loading) {
    return (
      <>
        <Topbar eyebrow="Sales" title="Order" />
        <div className="page"><Loader /></div>
      </>
    );
  }

  if (!order) return null;

  const user = order.customer;

  return (
    <>
      <Topbar eyebrow="Sales" title={order.orderNumber} />
      <div className="page">
        <button className="back-link" onClick={() => navigate('/orders')}>
          <IconChevronLeft /> Back to orders
        </button>

        <div className="page-header">
          <div>
            <h2>{order.orderNumber}</h2>
            <p>Placed {formatDateTime(order.createdAt)}</p>
          </div>
          <div className="page-header-actions">
            <Badge value={order.status} />
            <Badge value={order.paymentStatus} />
            <button className="icon-btn danger" onClick={() => setConfirmDelete(true)} aria-label="Delete order">
              <IconTrash />
            </button>
          </div>
        </div>

        <div className="card card-pad" style={{ marginBottom: 16 }}>
          <OrderStepper status={order.status} />
        </div>

        <div className="detail-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card card-pad">
              <div className="card-head"><h3>Items</h3></div>
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item) => (
                      <tr key={item.id}>
                        <td className="cell-primary">{item.productName || `Product #${item.productId}`}</td>
                        <td className="cell-muted">{item.quantity}</td>
                        <td className="cell-muted">{formatCurrency(item.discountPrice || item.price)}</td>
                        <td className="cell-primary">{formatCurrency(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card card-pad">
              <div className="card-head"><h3>Amount breakdown</h3></div>
              <div className="kv-list">
                <div className="kv-row"><span className="k">Subtotal</span><span className="v">{formatCurrency(order.subtotal)}</span></div>
                <div className="kv-row"><span className="k">Discount</span><span className="v">− {formatCurrency(order.discount)}</span></div>
                <div className="kv-row"><span className="k">Tax</span><span className="v">+ {formatCurrency(order.taxAmount)}</span></div>
                <div className="kv-row"><span className="k">Shipping</span><span className="v">+ {formatCurrency(order.shippingCharge)}</span></div>
                <div className="kv-row"><span className="k" style={{ fontWeight: 700, color: 'var(--text)' }}>Final amount</span><span className="v" style={{ fontSize: 15 }}>{formatCurrency(order.grandTotal)}</span></div>
              </div>
            </div>

            {order.notes && (
              <div className="card card-pad">
                <div className="card-head"><h3>Notes</h3></div>
                <p style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>{order.notes}</p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card card-pad">
              <div className="card-head"><h3>Shipping Information</h3></div>
              {user ? (
                <div className="kv-list">
                  <div className="kv-row"><span className="k">Name</span><span className="v">{order.shippingName}</span></div>
                  <div className="kv-row"><span className="k">Email</span><span className="v">{order.shippingEmail}</span></div>
                  {user.phone && <div className="kv-row"><span className="k">Phone</span><span className="v">{order.shippingPhone}</span></div>}
                </div>
              ) : <p className="cell-muted">No customer info</p>}
            </div>

            <div className="card card-pad">
              <div className="card-head"><h3>Shipping address</h3></div>
              <p style={{ fontSize: 13.5, lineHeight: 1.6 }}>
                {order.shippingAddress || '—'}<br />
                {[order.shippingCity, order.shippingState, order.shippingZipCode].filter(Boolean).join(', ')}<br />
                {order.shippingCountry}
              </p>
              {order.paymentMethod && (
                <p className="cell-muted" style={{ fontSize: 12.5, marginTop: 10 }}>Paid via {order.paymentMethod}</p>
              )}
            </div>

            <div className="card card-pad">
              <div className="card-head"><h3>Update status</h3></div>
              <div className="field">
                <label>Order status</label>
                <select
                  value={order.status}
                  onChange={(e) => handleOrderUpdate("status", e.target.value)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Payment status</label>
                <select
                  value={order.paymentStatus}
                  onChange={(e) => handleOrderUpdate("paymentStatus", e.target.value)}
                >
                  {PAYMENT_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Payment Method</label>
                <select
                  value={order.paymentMethod}
                  onChange={(e) => handleOrderUpdate("paymentMethod", e.target.value)}
                >
                  {PAYMENT_METHOD_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Tracking number</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="e.g. IND0012345" />
                  <button className="btn btn-outline btn-sm" onClick={handleTrackingSave} disabled={savingTracking}>
                    {savingTracking ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="Delete order"
          message={`Delete order ${order.orderNumber}? This can't be undone.`}
          onConfirm={handleDelete}
          onClose={() => setConfirmDelete(false)}
        />
      )}
    </>
  );
}
