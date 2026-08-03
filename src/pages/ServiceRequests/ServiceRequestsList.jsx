import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../components/Topbar.jsx';
import { Loader, EmptyState } from '../../components/Loader.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useData } from '../../context/DataContext.jsx';
import { IconEye, IconTrash } from '../../components/icons.jsx';

const REQUEST_TYPES = ['feedback', 'complaint', 'inquiry', 'partnership', 'order_inquiry', 'other'];
const STATUSES = ['pending', 'in_progress', 'resolved', 'rejected'];
const PRIORITIES = ['low', 'medium', 'high'];

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ServiceRequestsList() {
  const navigate = useNavigate();
  const toast = useToast();
  const {
    serviceRequests,
    serviceRequestsLoading,
    serviceRequestsMeta,
    fetchServiceRequests,
    removeServiceRequest,
    updateServiceRequestStatus,
  } = useData();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [statusDialog, setStatusDialog] = useState(null);
  const [statusFormData, setStatusFormData] = useState({ status: '', priority: '', adminNotes: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const params = {
      page,
      limit: 10,
      ...(statusFilter && { status: statusFilter }),
      ...(typeFilter && { requestType: typeFilter }),
      ...(priorityFilter && { priority: priorityFilter }),
    };
    fetchServiceRequests(params);
  }, [page, statusFilter, typeFilter, priorityFilter, fetchServiceRequests]);

  const filtered = (serviceRequests || [])
    .filter((r) => !search ||
      r.subject?.toLowerCase().includes(search.toLowerCase()) ||
      r.customerEmail?.toLowerCase().includes(search.toLowerCase())
    );

  const handleStatusUpdate = async () => {
    if (!statusDialog || !statusFormData.status) return;

    setIsSubmitting(true);
    try {
      await updateServiceRequestStatus(statusDialog.id, {
        status: statusFormData.status,
        priority: statusFormData.priority || statusDialog.priority,
        adminNotes: statusFormData.adminNotes,
      });
      toast.success('Service request updated');
      setStatusDialog(null);
      await fetchServiceRequests({ page, limit: 10, status: statusFilter, requestType: typeFilter });
    } catch (err) {
      toast.error(err.message || 'Failed to update service request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await removeServiceRequest(deleting.id);
      toast.success('Service request deleted');
      setDeleting(null);
      await fetchServiceRequests({ page, limit: 10, status: statusFilter, requestType: typeFilter });
    } catch (err) {
      toast.error(err.message || 'Failed to delete service request');
    }
  };

  return (
    <>
      <Topbar
        eyebrow="Support"
        title="Service Requests"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by subject or customer email…"
      />
      <div className="page">
        <div className="page-header">
          <div>
            <h2>Service Requests</h2>
            <p>Manage customer inquiries, complaints, returns, and support tickets.</p>
          </div>
        </div>

        <div className="table-wrap">
          <div className="table-toolbar">
            <div className="table-toolbar-filters">
              <select className="filter-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                <option value="">All statuses</option>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select className="filter-select" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}>
                <option value="">All types</option>
                {REQUEST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select className="filter-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                <option value="">All priorities</option>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {serviceRequestsLoading ? (
            <Loader />
          ) : filtered.length === 0 ? (
            <EmptyState
              // icon={null}
              title="No service requests found"
              message="Service requests will appear here when customers submit them."
            />
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Customer</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <div className="cell-primary">{request.subject || '—'}</div>
                        <div className="cell-muted" style={{ fontSize: 12 }}>{request.email || request.customerEmail || '—'}</div>
                      </td>
                      <td className="cell-muted">{request.name || '—'}</td>
                      <td><span style={{ fontSize: 12, textTransform: 'capitalize' }}>{request.requestType || '—'}</span></td>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: 12,
                            fontSize: 12,
                            fontWeight: 500,
                            backgroundColor: request.status === 'resolved' ? 'rgba(34, 197, 94, 0.1)' :
                              request.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' :
                                request.status === 'in_progress' ? 'rgba(59, 130, 246, 0.1)' :
                                  'rgba(107, 114, 128, 0.1)',
                            color: request.status === 'resolved' ? '#22c55e' :
                              request.status === 'rejected' ? '#ef4444' :
                                request.status === 'in_progress' ? '#3b82f6' :
                                  '#6b7280',
                            textTransform: 'capitalize',
                          }}
                        >
                          {request.status || '—'}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: 12,
                            fontSize: 12,
                            fontWeight: 500,
                            backgroundColor: request.priority === 'high' ? 'rgba(239, 68, 68, 0.1)' :
                              request.priority === 'medium' ? 'rgba(251, 146, 60, 0.1)' :
                                'rgba(34, 197, 94, 0.1)',
                            color: request.priority === 'high' ? '#ef4444' :
                              request.priority === 'medium' ? '#fb923c' :
                                '#22c55e',
                            textTransform: 'capitalize',
                          }}
                        >
                          {request.priority || '—'}
                        </span>
                      </td>
                      <td className="cell-muted">{formatDate(request.createdAt)}</td>
                      <td>
                        <div className="row-actions">
                          <button
                            className="icon-btn"
                            onClick={() => {
                              setStatusDialog(request);
                              setStatusFormData({ status: request.status || '', priority: request.priority || '', adminNotes: request.adminNotes || '' });
                            }}
                            aria-label="View details"
                          >
                            <IconEye />
                          </button>
                          <button
                            className="icon-btn danger"
                            onClick={() => setDeleting(request)}
                            aria-label="Delete"
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </td>
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
                {serviceRequestsMeta.total === 0
                  ? 0
                  : (serviceRequestsMeta.currentPage - 1) * 10 + 1}{" "}
                to{" "}
                {Math.min(
                  serviceRequestsMeta.currentPage * 10,
                  serviceRequestsMeta.total
                )}{" "}
                of {serviceRequestsMeta.total} requests
              </div>
              {serviceRequestsMeta.totalPages > 1 && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-sm" onClick={() => setPage(serviceRequestsMeta.currentPage - 1)} disabled={serviceRequestsMeta.currentPage === 1}>← Previous</button>
                  <button className="btn btn-sm" onClick={() => setPage(serviceRequestsMeta.currentPage + 1)} disabled={serviceRequestsMeta.currentPage === serviceRequestsMeta.totalPages}>Next →</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {statusDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: 8,
            padding: 24,
            maxWidth: 500,
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <h3 style={{ marginBottom: 16 }}>Update Service Request</h3>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6 }}>Status</label>
              <select
                value={statusFormData.status}
                onChange={(e) => setStatusFormData({ ...statusFormData, status: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6 }}
              >
                <option value="">Select status</option>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6 }}>Priority</label>
              <select
                value={statusFormData.priority}
                onChange={(e) => setStatusFormData({ ...statusFormData, priority: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6 }}
              >
                <option value="">Select priority</option>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6 }}>Admin Notes</label>
              <textarea
                value={statusFormData.adminNotes}
                onChange={(e) => setStatusFormData({ ...statusFormData, adminNotes: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6, fontFamily: 'inherit', minHeight: 100 }}
              />
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setStatusDialog(null)}>Cancel</button>
              <button className="btn btn-gold" onClick={handleStatusUpdate} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleting && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: 8,
            padding: 24,
            maxWidth: 400,
          }}>
            <h3 style={{ marginBottom: 8 }}>Delete Service Request</h3>
            <p style={{ marginBottom: 20, color: 'var(--text-muted)' }}>
              Are you sure you want to delete this service request? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setDeleting(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
