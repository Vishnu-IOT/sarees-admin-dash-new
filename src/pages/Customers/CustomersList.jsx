import React, { useState } from 'react';
import Topbar from '../../components/Topbar.jsx';
import { Loader, EmptyState } from '../../components/Loader.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useNavigate } from 'react-router-dom';

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function CustomersList() {
  const navigate = useNavigate();
  const {
    customers,
    customersLoading,
    customersMeta,
    fetchCustomers,
  } = useData();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchCustomers(newPage, 10);
  };

  const filtered = (customers || [])
    .filter((c) => !search ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phoneNo?.includes(search)
    );

  const totalOrdersAcrossCustomers = filtered.reduce(
    (sum, c) => sum + Number(c.orderCount || 0),
    0
  );
  const repeatCustomers = filtered.filter((c) => Number(c.orderCount || 0) > 1).length;

  const totalPages = Math.ceil(customersMeta.totalCustomers / 10);

  return (
    <>
      <Topbar
        eyebrow="People"
        title="Customers"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, email, or phone…"
      />
      <div className="page">
        <div className="page-header">
          <div>
            <h2>Customer Management</h2>
            <p>Everyone who has signed up on the storefront, with their order history at a glance.</p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}>
          <div style={{
            padding: 16,
            backgroundColor: 'var(--surface)',
            borderRadius: 8,
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Total Customers</div>
            <div style={{ fontSize: 24, fontWeight: 600 }}>{customersMeta.totalCustomers}</div>
          </div>
          <div style={{
            padding: 16,
            backgroundColor: 'var(--surface)',
            borderRadius: 8,
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Repeat Customers</div>
            <div style={{ fontSize: 24, fontWeight: 600 }}>{repeatCustomers}</div>
          </div>
          <div style={{
            padding: 16,
            backgroundColor: 'var(--surface)',
            borderRadius: 8,
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Orders (this page)</div>
            <div style={{ fontSize: 24, fontWeight: 600 }}>{totalOrdersAcrossCustomers}</div>
          </div>
        </div>

        <div className="table-wrap">
          {customersLoading ? (
            <Loader />
          ) : customers.length === 0 ? (
            <EmptyState
              icon={null}
              title="No customers found"
              message="Customers will appear here once they sign up on the storefront."
            />
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Location</th>
                    <th>Orders</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((customer) => (
                    // <tr key={customer.id}>
                    <tr key={customer.id} className="clickable" onClick={() => navigate(`/customers/${customer.id}`)}>
                      <td>
                        <div className="cell-primary">{customer.name || '—'}</div>
                      </td>
                      <td className="cell-muted">{customer.phoneNo || '—'}</td>
                      <td className="cell-muted">{customer.email || '—'}</td>
                      <td className="cell-muted">{customer.city || customer?.["customers.address"] || '—'}</td>
                      <td>
                        <div style={{
                          display: 'inline-block',
                          backgroundColor: 'var(--gold-soft)',
                          color: 'var(--gold)',
                          padding: '4px 12px',
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 500,
                        }}>
                          {customer.orderCount || 0}
                        </div>
                      </td>
                      <td className="cell-muted">{formatDate(customer.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filtered.length > 0 && (
            <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Showing{" "}
                {customersMeta.totalCustomers === 0
                  ? 0
                  : (customersMeta.currentPage - 1) * 10 + 1}{" "}
                to{" "}
                {Math.min(customersMeta.currentPage * 10, customersMeta.totalCustomers)}{" "}
                of {customersMeta.totalCustomers} customers
              </div>
              {customersMeta.totalPages > 1 && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-sm" onClick={() => handlePageChange(customersMeta.currentPage - 1)} disabled={customersMeta.currentPage === 1}>← Previous</button>
                  <button className="btn btn-sm" onClick={() => handlePageChange(customersMeta.currentPage + 1)} disabled={customersMeta.currentPage === customersMeta.totalPages}>Next →</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
