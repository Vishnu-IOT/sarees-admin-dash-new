import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Topbar from "../../components/Topbar.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import { Loader, EmptyState } from "../../components/Loader.jsx";
import ProductForm from "./ProductForm.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { useData } from "../../context/DataContext.jsx";
import { IconPlus, IconEdit, IconTrash } from "../../components/icons.jsx";
import { formatCurrency } from "../../utils/format.js";
import Badge from "../../components/Badge.jsx";
import ImageThumb from "../../components/ImageThumb.jsx";
import { updateProductStatus } from "../../api/products.js";

export default function ProductsList() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const {
    products,
    pageProducts,
    productsCollection,
    productsLoading,
    categories,
    addProduct,
    editProduct,
    removeProduct,
    fetchProducts,
  } = useData();

  const [search, setSearch] = useState("");
  const [collection, setCollection] = useState(productsCollection || "ALL");
  const [page, setPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const handleCollectionChange = (newCollection) => {
    setCollection(newCollection);
    setPage(1);
    fetchProducts(1, 10, newCollection);
  };

  const filtered = (products || [])
    .filter(
      (p) =>
        !search ||
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase()),
    )
    .map((p) => ({
      ...p,
      totalQuantity: (p.attributes || []).reduce(
        (sum, attr) => sum + Number(attr.quantity || 0),
        0,
      ),
    }));

  const openCreate = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditingProduct(p);
    setShowForm(true);
  };

  const handleSaved = async () => {
    setShowForm(false);
    await fetchProducts(page, 10, collection);
  };

  const handleDelete = async () => {
    try {
      await removeProduct(deleting.id);
      toast.success("Product deleted");
      setDeleting(null);
    } catch (err) {
      toast.error(err.message || "Failed to delete product");
    }
  };

  const handleStatusUpdate = async (product) => {
    if (!product) return;

    const newStatus = product.status === "active" ? "inactive" : "active";

    try {
      await updateProductStatus(product.id, newStatus);

      toast.success(
        `Product ${newStatus === "active" ? "activated" : "deactivated"}`,
      );

      await fetchProducts(page, 10, collection);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to update product status",
      );
    }
  };

  return (
    <>
      <Topbar
        eyebrow="Catalogue"
        title="Products"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or SKU…"
      />
      <div className="page">
        <div className="page-header">
          <div>
            <h2>All products</h2>
            <p>{pageProducts.total} products in your catalogue</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-gold" onClick={openCreate}>
              <IconPlus /> Add product
            </button>
          </div>
        </div>

        <div className="table-wrap">
          <div className="table-toolbar">
            <div className="table-toolbar-filters">
              <div className="collection-tabs">
                {[
                  { value: "ALL", label: "All Products" },
                  { value: "SAREE", label: "Sarees" },
                  { value: "JEWEL", label: "Jewels" },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    className={`collection-tab ${
                      collection === tab.value ? "active" : ""
                    }`}
                    onClick={() => handleCollectionChange(tab.value)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {productsLoading ? (
            <Loader />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={IconTrash}
              title="No products found"
              message="Try adjusting your filters, or add your first product."
              action={
                <button className="btn btn-gold btn-sm" onClick={openCreate}>
                  <IconPlus /> Add product
                </button>
              }
            />
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    // <tr key={p.id}>
                    <tr
                      key={p.id}
                      className="clickable"
                      onClick={() => navigate(`/products/${p.id}`)}
                    >
                      <td>
                        <div className="row-thumb">
                          <ImageThumb
                            src={p.attributes[0].image_url}
                            alt={p.name}
                          />
                          <div>
                            <div className="cell-primary">{p.name}</div>
                            <div
                              className="cell-muted"
                              style={{ fontSize: 12 }}
                            >
                              {p.collection || "—"}{" "}
                              {p.isNewArrival && (
                                <span
                                  className="badge badge-neutral"
                                  style={{ marginLeft: 6 }}
                                >
                                  New
                                </span>
                              )}
                              {p.loom && (
                                <span
                                  className="badge badge-gold"
                                  style={{ marginLeft: 6 }}
                                >
                                  Loom
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="cell-mono">{p.attributes[0].sku}</td>
                      <td className="cell-muted">{p.category?.name || "—"}</td>
                      <td className="cell-primary">
                        {formatCurrency(
                          p.attributes[0].offerPrice || p.attributes[0].price,
                        )}
                        {p.attributes[0].offerPrice && (
                          <div
                            className="cell-muted"
                            style={{
                              fontSize: 11.5,
                              textDecoration: "line-through",
                            }}
                          >
                            {formatCurrency(p.attributes[0].price)}
                          </div>
                        )}
                      </td>
                      <td
                        className={
                          p.totalQuantity <= 5 ? "cell-primary" : "cell-muted"
                        }
                        style={
                          p.totalQuantity <= 5
                            ? { color: "var(--danger)" }
                            : undefined
                        }
                      >
                        {p.totalQuantity}
                      </td>
                      <td>
                        <Badge value={p.status} />
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="row-actions">
                          <button
                            type="button"
                            className="icon-btn"
                            onClick={() => handleStatusUpdate(p)}
                            aria-label={
                              p.status === "active"
                                ? "Deactivate product"
                                : "Activate product"
                            }
                            title={
                              p.status === "active"
                                ? "Deactivate product"
                                : "Activate product"
                            }
                          >
                            {p.status === "active" ? "⏸" : "▶"}
                          </button>
                          <button
                            className="icon-btn"
                            onClick={() => openEdit(p)}
                            aria-label="Edit"
                          >
                            <IconEdit />
                          </button>
                          <button
                            className="icon-btn danger"
                            onClick={() => setDeleting(p)}
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
              {pageProducts.total === 0
                ? 0
                : (pageProducts.currentPage - 1) * 10 + 1}{" "}
              to {Math.min(pageProducts.currentPage * 10, pageProducts.total)}{" "}
              of {pageProducts.total} products
            </div>
            {pageProducts.totalPages > 1 && (
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn btn-sm"
                  disabled={pageProducts.currentPage === 1}
                  onClick={() => {
                    const prev = pageProducts.currentPage - 1;
                    setPage(prev);
                    fetchProducts(prev, 10, collection);
                  }}
                >
                  ← Previous
                </button>
                <span style={{ padding: "6px 12px", fontSize: 13 }}>
                  {pageProducts.currentPage} / {pageProducts.totalPages}
                </span>
                <button
                  className="btn btn-sm"
                  disabled={
                    pageProducts.currentPage === pageProducts.totalPages
                  }
                  onClick={() => {
                    const next = pageProducts.currentPage + 1;
                    setPage(next);
                    fetchProducts(next, 10, collection);
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <ProductForm
          product={editingProduct}
          categories={categories}
          onClose={() => setShowForm(false)}
          onSaved={handleSaved}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete product"
          message={`Delete "${deleting.name}"? This can't be undone.`}
          onConfirm={handleDelete}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}
