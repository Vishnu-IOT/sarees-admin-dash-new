import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Topbar from '../../components/Topbar.jsx';
import Badge from '../../components/Badge.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import { Loader, EmptyState } from '../../components/Loader.jsx';
import UserForm from './UserForm.jsx';
import { usersApi } from '../../api/users';
import { ordersApi } from '../../api/orders';
import { useToast } from '../../context/ToastContext.jsx';
import { formatCurrency, formatDate, initials } from '../../utils/format';
import { IconChevronLeft, IconEdit, IconTrash, IconOrders } from '../../components/icons.jsx';

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [userRes, ordersRes] = await Promise.all([
        usersApi.get(id),
        // ordersApi.getUserOrders(id, { limit: 20 })
      ]);
      setUser(userRes);
      // setOrders(ordersRes.data || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    await usersApi.remove(id).then(() => {
      toast.success('Customer deleted');
      navigate('/users');
    }).catch((err) => toast.error(err.message));
  };

  if (loading) {
    return (
      <>
        <Topbar eyebrow="Sales" title="Customer" />
        <div className="page"><Loader /></div>
      </>
    );
  }

  if (!user) return null;

  const totalSpent = orders
    .filter((o) => o.paymentStatus === 'completed')
    .reduce((sum, o) => sum + Number(o.finalAmount || 0), 0);

  return (
    <>
      <Topbar eyebrow="Sales" title={`${user.firstName} ${user.lastName}`} />
      <div className="page">
        <button className="back-link" onClick={() => navigate('/users')}>
          <IconChevronLeft /> Back to customers
        </button>

        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="avatar-circle" style={{ width: 48, height: 48, fontSize: 16 }}>
              {initials(user.firstName, user.lastName)}
            </div>
            <div>
              <h2>{user.firstName} {user.lastName}</h2>
              <p>{user.email}</p>
            </div>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-outline" onClick={() => setShowForm(true)}><IconEdit /> Edit</button>
            <button className="icon-btn danger" onClick={() => setConfirmDelete(true)} aria-label="Delete customer"><IconTrash /></button>
          </div>
        </div>

        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="stat-card">
            <div className="stat-card-top"><span className="stat-card-label">Orders placed</span></div>
            <div className="stat-card-value">{orders.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-top"><span className="stat-card-label">Total spent</span></div>
            <div className="stat-card-value">{formatCurrency(totalSpent)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-top"><span className="stat-card-label">Customer since</span></div>
            <div className="stat-card-value" style={{ fontSize: 20 }}>{formatDate(user.createdAt)}</div>
          </div>
        </div>

        <div className="detail-grid">
          <div className="card card-pad">
            <div className="card-head"><h3>Order history</h3></div>
            {orders.length === 0 ? (
              <EmptyState icon={IconOrders} title="No orders yet" message="This customer hasn't placed any orders." />
            ) : (
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="clickable" onClick={() => navigate(`/orders/${o.id}`)}>
                        <td className="cell-mono cell-primary">{o.orderNumber}</td>
                        <td className="cell-muted">{formatDate(o.createdAt)}</td>
                        <td className="cell-primary">{formatCurrency(o.finalAmount)}</td>
                        <td><Badge value={o.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card card-pad">
            <div className="card-head"><h3>Contact & address</h3></div>
            <div className="kv-list">
              <div className="kv-row"><span className="k">Phone</span><span className="v">{user.phone || '—'}</span></div>
              <div className="kv-row"><span className="k">Address</span><span className="v">{user.address || '—'}</span></div>
              <div className="kv-row"><span className="k">City</span><span className="v">{user.city || '—'}</span></div>
              <div className="kv-row"><span className="k">State</span><span className="v">{user.state || '—'}</span></div>
              <div className="kv-row"><span className="k">ZIP code</span><span className="v">{user.zipCode || '—'}</span></div>
              <div className="kv-row"><span className="k">Country</span><span className="v">{user.country || '—'}</span></div>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <UserForm user={user} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />
      )}
      {confirmDelete && (
        <ConfirmDialog
          title="Delete customer"
          message={`Delete ${user.firstName} ${user.lastName}? This also removes their order history and can't be undone.`}
          onConfirm={handleDelete}
          onClose={() => setConfirmDelete(false)}
        />
      )}
    </>
  );
}
