import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Topbar from '../components/Topbar.jsx';
import StatCard from '../components/StatCard.jsx';
import Badge from '../components/Badge.jsx';
import { Loader } from '../components/Loader.jsx';
import { MiniBarChart, DonutChart } from '../components/Charts.jsx';
import { productsApi } from '../api/products';
import { ordersApi } from '../api/orders';
import { usersApi } from '../api/users';
import { categoriesApi } from '../api/categories';
import { formatCurrency, timeAgo } from '../utils/format';
import { IconBox, IconOrders, IconUsers, IconRupee, IconClock, IconTruck } from '../components/icons.jsx';

// The backend has no dedicated analytics endpoint, so this dashboard pulls
// the existing list endpoints (with a generous limit) and aggregates on
// the client. For a store with a very large catalogue you'd eventually
// want a real /api/analytics endpoint on the backend instead.
const SAMPLE_LIMIT = 500;

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [productsRes, ordersRes, usersRes, categoriesRes] = await Promise.all([
          productsApi.list({ limit: SAMPLE_LIMIT }),
          ordersApi.list({ limit: SAMPLE_LIMIT }),
          usersApi.list({ limit: SAMPLE_LIMIT }),
          categoriesApi.list({ limit: SAMPLE_LIMIT })
        ]);
        if (true) {
          setData({
            products: productsRes.products,
            productsTotal: productsRes?.total ?? productsRes.data.length,
            orders: ordersRes.data,
            ordersTotal: ordersRes?.totalOrders ?? ordersRes.data.length,
            users: usersRes.data,
            usersTotal: usersRes?.count ?? usersRes.data.length,
            categories: categoriesRes.data
          });
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <>
        <Topbar eyebrow="Overview" title="Dashboard" />
        <div className="page"><Loader /></div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Topbar eyebrow="Overview" title="Dashboard" />
        <div className="page">
          <div className="card card-pad" style={{ color: 'var(--danger)' }}>
            Couldn't load the dashboard: {error}. Is the backend running at the configured API URL?
          </div>
        </div>
      </>
    );
  }

  const { products, productsTotal, orders, ordersTotal, users, usersTotal, categories } = data;

  const revenue = orders
    .filter((o) => o.paymentStatus === 'Paid')
    .reduce((sum, o) => sum + Number(o.grandTotal || 0), 0);

  const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
  const lowStock = products.filter((p) => p.quantity <= 5).length;

  // Orders per day, last 7 days
  const days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const barData = days.map((d) => {
    const label = d.toLocaleDateString('en-IN', { weekday: 'short' });
    const count = orders.filter((o) => {
      const od = new Date(o.createdAt);
      return od.toDateString() === d.toDateString();
    }).length;
    return { label, value: count };
  });

  // Order status breakdown
  const statusCounts = {};
  orders.forEach((o) => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });
  const donutData = Object.entries(statusCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value }));

  // Top categories by product count
  const categoryCounts = categories
    .map((c) => ({
      name: c.name,
      count: products.filter((p) => p.categoryId === c.id).length
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  return (
    <>
      <Topbar eyebrow="Overview" title="Dashboard" />
      <div className="page">
        <div className="stat-grid">
          <StatCard icon={IconRupee} label="Revenue collected" value={formatCurrency(revenue)} note="From completed payments" />
          <StatCard icon={IconOrders} label="Total orders" value={ordersTotal} note={`${pendingOrders} pending action`} />
          <StatCard icon={IconBox} label="Products" value={productsTotal} note={`${lowStock} low on stock`} />
          <StatCard icon={IconUsers} label="Customers" value={usersTotal} note="Registered accounts" />
        </div>

        <div className="dash-grid">
          <div className="card card-pad">
            <div className="card-head">
              <h3>Orders, last 7 days</h3>
              <span className="muted">Based on order date</span>
            </div>
            <MiniBarChart data={barData} />
          </div>
          <div className="card card-pad">
            <div className="card-head">
              <h3>Order status split</h3>
            </div>
            {donutData.length ? (
              <DonutChart data={donutData} />
            ) : (
              <p className="muted" style={{ fontSize: 13 }}>No orders yet.</p>
            )}
          </div>
        </div>

        <div className="dash-grid">
          <div className="card card-pad">
            <div className="card-head">
              <h3>Recent orders</h3>
              <Link to="/orders" className="muted">View all →</Link>
            </div>
            {recentOrders.length ? (
              <div className="recent-list">
                {recentOrders.map((o) => (
                  <div className="recent-item" key={o.id}>
                    <div className="avatar-circle">
                      <IconTruck style={{ width: 16, height: 16 }} />
                    </div>
                    <div className="ri-main">
                      <div className="ri-title">{o.orderNumber}</div>
                      <div className="ri-sub">
                        {o.customer ? `${o.customer.name}` : 'Customer'} · {timeAgo(o.createdAt)}
                      </div>
                    </div>
                    <Badge value={o.status} />
                    <div className="ri-amount">{formatCurrency(o.grandTotal)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted" style={{ fontSize: 13 }}>Orders will show up here as customers check out.</p>
            )}
          </div>

          <div className="card card-pad">
            <div className="card-head">
              <h3>Top categories</h3>
              <Link to="/categories" className="muted">Manage →</Link>
            </div>
            {categoryCounts.length ? (
              <div className="category-bars">
                {categoryCounts.map((c, i) => (
                  <div className="cat-row" key={c.name}>
                    <span className="cat-rank">{String(i + 1).padStart(2, '0')}</span>
                    <span className="cat-name">{c.name}</span>
                    <span className="cat-count">{c.count} products</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted" style={{ fontSize: 13 }}>Add a category to start organizing your catalogue.</p>
            )}
          </div>
        </div>

        {lowStock > 0 && (
          <div className="card card-pad" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span className="stat-card-icon" style={{ color: 'var(--danger)' }}><IconClock /></span>
            <div style={{ flex: 1 }}>
              <strong>{lowStock} product{lowStock > 1 ? 's' : ''} running low on stock</strong>
              <div className="muted" style={{ fontSize: 12.5 }}>5 units or fewer remaining</div>
            </div>
            <Link to="/products?stock=low" className="btn btn-outline btn-sm">Review stock</Link>
          </div>
        )}
      </div>
    </>
  );
}
