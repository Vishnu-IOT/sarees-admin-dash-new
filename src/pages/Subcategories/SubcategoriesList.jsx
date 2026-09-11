import React, { useCallback, useEffect, useState } from "react";
import Topbar from "../../components/Topbar.jsx";
import Badge from "../../components/Badge.jsx";
import Pagination from "../../components/Pagination.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import { Loader, EmptyState } from "../../components/Loader.jsx";
import SubcategoryForm from "./SubcategoryForm.jsx";
import {
  subcategoriesApi,
  updateSubCategoryStatus,
} from "../../api/subcategories";
import { categoriesApi } from "../../api/categories";
import { useToast } from "../../context/ToastContext.jsx";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconLayers,
} from "../../components/icons.jsx";

export default function SubcategoriesList() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState("");
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const ITEMS_PER_PAGE = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (categoryId) params.categoryId = categoryId;
      const res = await subcategoriesApi.list(params);
      setRows(res.data);
      // setPagination(res.pagination);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, categoryId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    categoriesApi
      .list({ limit: 200 })
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [search, categoryId]);

  const filtered = rows.filter(
    (s) =>
      (!search || s.name.toLowerCase().includes(search.toLowerCase())) &&
      (!categoryId || String(s.categoryId) === String(categoryId)),
  );
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const paginatedRows = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const handleDelete = async () => {
    await subcategoriesApi
      .remove(deleting.id)
      .then(() => {
        toast.success("Subcategory deleted");
        load();
      })
      .catch((err) => toast.error(err.message));
  };

  const handleStatusUpdate = async (category) => {
    if (!category) return;

    const newStatus = category.status === "active" ? "inactive" : "active";

    try {
      await updateSubCategoryStatus(category.id, newStatus);

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
        title="Subcategories"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search subcategories…"
      />
      <div className="page">
        <div className="page-header">
          <div>
            <h2>All subcategories</h2>
            <p>{rows.length} subcategories across your categories</p>
          </div>
          <div className="page-header-actions">
            <button
              className="btn btn-gold"
              onClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
            >
              <IconPlus /> Add subcategory
            </button>
          </div>
        </div>

        <div className="table-wrap">
          <div className="table-toolbar">
            <div className="table-toolbar-filters">
              <select
                className="filter-select"
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <Loader />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={IconLayers}
              title="No subcategories yet"
              message="Use subcategories to add finer distinctions within a category, like weave or region."
              action={
                <button
                  className="btn btn-gold btn-sm"
                  onClick={() => {
                    setEditing(null);
                    setShowForm(true);
                  }}
                >
                  <IconPlus /> Add subcategory
                </button>
              }
            />
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Subcategory</th>
                    <th>Parent category</th>
                    <th>Collection</th>
                    {/* <th>Description</th> */}
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRows.map((s) => (
                    <tr key={s.id}>
                      <td className="cell-primary">{s.name}</td>
                      <td className="cell-muted">{s.category?.name || "—"}</td>
                      <td className="cell-muted">
                        {s.category?.collection || "—"}
                      </td>
                      {/* <td className="cell-muted">{s.description || '—'}</td> */}
                      <td>
                        <Badge
                          value={s.status === "active" ? "active" : "inactive"}
                          label={s.status === "active" ? "Active" : "Inactive"}
                        />
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            type="button"
                            className="icon-btn"
                            onClick={() => handleStatusUpdate(s)}
                            aria-label={
                              s.status === "active"
                                ? "Deactivate category"
                                : "Activate category"
                            }
                            title={
                              s.status === "active"
                                ? "Deactivate category"
                                : "Activate category"
                            }
                          >
                            {s.status === "active" ? "⏸" : "▶"}
                          </button>
                          <button
                            className="icon-btn"
                            onClick={() => {
                              setEditing(s);
                              setShowForm(true);
                            }}
                            aria-label="Edit"
                          >
                            <IconEdit />
                          </button>
                          <button
                            className="icon-btn danger"
                            onClick={() => setDeleting(s)}
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
              {filtered.length} subcategories
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
        <SubcategoryForm
          subcategory={editing}
          categories={categories}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            load();
          }}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title="Delete subcategory"
          message={`Delete "${deleting.name}"? Subcategories with products can't be deleted — remove or reassign their products first.`}
          onConfirm={handleDelete}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}
