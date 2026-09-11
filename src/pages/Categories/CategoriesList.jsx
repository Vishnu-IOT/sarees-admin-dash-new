import React, { useCallback, useEffect, useState } from "react";
import Topbar from "../../components/Topbar.jsx";
import Badge from "../../components/Badge.jsx";
import Pagination from "../../components/Pagination.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import { Loader, EmptyState } from "../../components/Loader.jsx";
import CategoryForm from "./CategoryForm.jsx";
import { categoriesApi, updateCategoryStatus } from "../../api/categories";
import { useToast } from "../../context/ToastContext.jsx";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconCategory,
} from "../../components/icons.jsx";

export default function CategoriesList() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const ITEMS_PER_PAGE = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await categoriesApi.list();
      setRows(res.data);
      // setPagination(res.pagination);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const filtered = rows.filter(
    (c) => !search || c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const paginatedRows = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const handleDelete = async () => {
    if (!deleting) return;

    try {
      await categoriesApi.remove(deleting.id);

      toast.success("Category deleted");
      setDeleting(null);
      load();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to delete category",
      );
    }
  };

  const handleStatusUpdate = async (category) => {
    if (!category) return;

    const newStatus = category.status === "active" ? "inactive" : "active";

    try {
      await updateCategoryStatus(category.id, newStatus);

      toast.success(
        `Category ${newStatus === "active" ? "activated" : "deactivated"}`,
      );

      load();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to update category status",
      );
    }
  };

  return (
    <>
      <Topbar
        eyebrow="Catalogue"
        title="Categories"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search categories…"
      />
      <div className="page">
        <div className="page-header">
          <div>
            <h2>All categories</h2>
            <p>{rows?.length ?? 0} categories organizing your catalogue</p>
          </div>
          <div className="page-header-actions">
            <button
              className="btn btn-gold"
              onClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
            >
              <IconPlus /> Add category
            </button>
          </div>
        </div>

        <div className="table-wrap">
          {loading ? (
            <Loader />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={IconCategory}
              title="No categories yet"
              message="Categories group your sarees so shoppers can browse by type."
              action={
                <button
                  className="btn btn-gold btn-sm"
                  onClick={() => {
                    setEditing(null);
                    setShowForm(true);
                  }}
                >
                  <IconPlus /> Add category
                </button>
              }
            />
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Collection</th>
                    {/* <th>Description</th> */}
                    <th>Subcategories</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRows.map((c) => (
                    <tr key={c.id}>
                      <td className="cell-primary">{c.name}</td>
                      <td className="cell-muted">{c.collection || "—"}</td>
                      {/* <td className="cell-muted">{c.description || '—'}</td> */}
                      <td className="cell-muted">{c.subcategoryCount ?? 0}</td>
                      <td>
                        <Badge
                          value={c.status === "active" ? "active" : "inactive"}
                          label={c.status === "active" ? "Active" : "Inactive"}
                        />
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            type="button"
                            className="icon-btn"
                            onClick={() => handleStatusUpdate(c)}
                            aria-label={
                              c.status === "active"
                                ? "Deactivate category"
                                : "Activate category"
                            }
                            title={
                              c.status === "active"
                                ? "Deactivate category"
                                : "Activate category"
                            }
                          >
                            {c.status === "active" ? "⏸" : "▶"}
                          </button>
                          <button
                            className="icon-btn"
                            onClick={() => {
                              setEditing(c);
                              setShowForm(true);
                            }}
                            aria-label="Edit"
                          >
                            <IconEdit />
                          </button>
                          <button
                            className="icon-btn danger"
                            onClick={() => setDeleting(c)}
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
          {/* <Pagination pagination={pagination} onPageChange={setPage} /> */}
          <div
            style={{
              padding: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid var(--border)",
            }}
          >
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Showing{" "}
              {filtered.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(page * ITEMS_PER_PAGE, filtered.length)} of{" "}
              {filtered.length} categories
            </div>

            {totalPages > 1 && (
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn btn-sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  ← Previous
                </button>

                <span style={{ padding: "6px 12px", fontSize: 13 }}>
                  {page} / {totalPages}
                </span>

                <button
                  className="btn btn-sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <CategoryForm
          category={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            load();
          }}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title="Delete category"
          message={`Delete "${deleting.name}"? Categories with products can't be deleted — remove or reassign their products first.`}
          onConfirm={handleDelete}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}
