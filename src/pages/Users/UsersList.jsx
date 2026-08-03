import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../components/Topbar.jsx';
import Pagination from '../../components/Pagination.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import { Loader, EmptyState } from '../../components/Loader.jsx';
import UserForm from './UserForm.jsx';
import { usersApi } from '../../api/users';
import { useToast } from '../../context/ToastContext.jsx';
import { initials } from '../../utils/format';
import { IconPlus, IconEdit, IconTrash, IconUsers } from '../../components/icons.jsx';

export default function UsersList() {
  const toast = useToast();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  // const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const ITEMS_PER_PAGE = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await usersApi.list();
      setRows(res.data);
      // setPagination(res.pagination);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const filtered = rows.filter((u) => {
    const s = search.toLowerCase();

    return (
      u.role === "Admin" &&
      (
        !search ||
        u.name?.toLowerCase().includes(s) ||
        u.email?.toLowerCase().includes(s)
      )
    );
  });

  const handleDelete = async () => {
    await usersApi.remove(deleting.id).then(() => {
      toast.success('Customer deleted');
      load();
    }).catch((err) => toast.error(err.message));
  };

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const paginatedRows = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const pagination = {
    currentPage: page,
    pages: totalPages,
    total: filtered.length,
  };

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <>
      <Topbar eyebrow="Admin" title="Admin" search={search} onSearchChange={setSearch} searchPlaceholder="Search admins…" />
      <div className="page">
        <div className="page-header">
          <div>
            <h2>All Admin Users</h2>
            <p>{filtered.filter((u) => u.role === "Admin")?.length ?? 0} registered accounts</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-gold" onClick={() => { setEditing(null); setShowForm(true); }}>
              <IconPlus /> Add Admin
            </button>
          </div>
        </div>

        <div className="table-wrap">
          {loading ? (
            <Loader />
          ) : filtered.length === 0 ? (
            <EmptyState icon={IconUsers} title="No Users yet" message="Admin Users who create an account will show up here." />
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>SI No</th>
                    <th>User</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRows.map((u, idx) => (
                    // <tr key={u.id} className="clickable" onClick={() => navigate(`/users/${u.id}`)}>
                    <tr key={u.id}>
                      <td>{(page - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                      <td>
                        <div className="row-thumb">
                          <div className="avatar-circle" style={{ width: 34, height: 34, fontSize: 12 }}>
                            {initials(u.name, u.name)}
                          </div>
                          <span className="cell-primary">{u.name}</span>
                        </div>
                      </td>
                      <td className="cell-muted">{u.email}</td>
                      <td className="cell-muted">{u.phoneNo || '—'}</td>
                      <td className="cell-muted">{u.role || '—'}</td>
                      {/* <td className="cell-muted">{[u.city, u.state].filter(Boolean).join(', ') || '—'}</td> */}
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="row-actions">
                          <button className="icon-btn" onClick={() => { setEditing(u); setShowForm(true); }} aria-label="Edit"><IconEdit /></button>
                          <button className="icon-btn danger" onClick={() => setDeleting(u)} aria-label="Delete"><IconTrash /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      </div>

      {showForm && (
        <UserForm user={editing} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />
      )}
      {deleting && (
        <ConfirmDialog
          title="Delete admin"
          message={`Delete ${deleting.name}? This also removes their order history and can't be undone.`}
          onConfirm={handleDelete}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}
