import React, { useState } from "react";
import Topbar from "../../components/Topbar.jsx";
import { Loader, EmptyState } from "../../components/Loader.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { useData } from "../../context/DataContext.jsx";
import { IconPlus, IconTrash } from "../../components/icons.jsx";
import Badge from "../../components/Badge.jsx";

export default function NewArrivalsList() {
  const toast = useToast();

  const {
    newArrivals,
    newArrivalsLoading,
    products,
    addToNewArrival,
    removeNewArrival,
    fetchNewArrivals,
  } = useData();

  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // =========================
  // FILTER NEW ARRIVALS
  // =========================

  const filtered = (newArrivals || []).filter(
    (item) =>
      !search ||
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.attributes?.[0]?.sku?.toLowerCase().includes(search.toLowerCase()),
  );

  // =========================
  // REMOVE FROM NEW ARRIVALS
  // =========================

  const handleRemove = async (newArrival) => {
    if (
      window.confirm(
        `Remove "${newArrival.name}" from New Arrivals?\n\n` +
          `This only removes the New Arrival tag — the product itself will NOT be deleted.`,
      )
    ) {
      try {
        await removeNewArrival(newArrival.id);

        toast.success("Removed from New Arrivals");

        // Refresh the list
        await fetchNewArrivals();
      } catch (err) {
        toast.error(
          err.response?.data?.message ||
            err.message ||
            "Failed to remove product from New Arrivals",
        );
      }
    }
  };

  // =========================
  // ADD TO NEW ARRIVALS
  // =========================

  const handleAddToNewArrival = async (productId) => {
    setIsAdding(true);

    try {
      await addToNewArrival(productId);

      toast.success("Added to New Arrivals");

      setShowAddModal(false);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to add product to New Arrivals",
      );
    } finally {
      setIsAdding(false);
    }
  };

  // =========================
  // PRODUCTS NOT ALREADY
  // IN NEW ARRIVALS
  // =========================

  const availableProducts = (products || []).filter(
    (product) => !(newArrivals || []).some((item) => item.id === product.id),
  );

  return (
    <>
      <Topbar
        eyebrow="Catalogue"
        title="New Arrivals"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or SKU…"
      />

      <div className="page">
        <div className="page-header">
          <div>
            <h2>New Arrivals</h2>

            <p>Showcase the latest products added to your collection.</p>

            <p
              style={{
                marginTop: 8,
                fontSize: 13,
                color: "var(--text-muted)",
              }}
            >
              {filtered.length} items in New Arrivals
            </p>
          </div>

          <div className="page-header-actions">
            <button
              className="btn btn-gold"
              onClick={() => setShowAddModal(true)}
            >
              <IconPlus /> Add to New Arrivals
            </button>
          </div>
        </div>

        <div className="table-wrap">
          {newArrivalsLoading ? (
            <Loader />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={IconPlus}
              title="No new arrivals yet"
              message="Tag existing products as New Arrivals."
              action={
                <button
                  className="btn btn-gold btn-sm"
                  onClick={() => setShowAddModal(true)}
                >
                  <IconPlus /> Add to New Arrivals
                </button>
              }
            />
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>SI.No</th>
                    <th>Product Name</th>
                    <th>SKU</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((newArrival, idx) => (
                    <tr key={newArrival.id}>
                      <td className="cell-mono">{idx + 1}</td>

                      <td>
                        <div className="cell-primary">{newArrival.name}</div>
                      </td>

                      <td className="cell-mono">
                        {newArrival.attributes?.[0]?.sku || "—"}
                      </td>

                      <td>
                        <Badge
                          value={
                            newArrival.status === "active"
                              ? "active"
                              : "inactive"
                          }
                          label={
                            newArrival.status === "active"
                              ? "Active"
                              : "Inactive"
                          }
                        />
                      </td>

                      <td>
                        <div className="row-actions">
                          <button
                            type="button"
                            className="icon-btn danger"
                            onClick={() => handleRemove(newArrival)}
                            aria-label="Remove from New Arrivals"
                            title="Remove from New Arrivals"
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
        </div>
      </div>

      {/* =========================
          ADD NEW ARRIVAL MODAL
          ========================= */}

      {showAddModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: 8,
              padding: 24,
              maxWidth: 500,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h3 style={{ marginBottom: 16 }}>Add to New Arrivals</h3>

            <p
              style={{
                marginBottom: 16,
                fontSize: 13,
                color: "var(--text-muted)",
              }}
            >
              Select products to tag as New Arrivals.
            </p>

            <div
              style={{
                maxHeight: 400,
                overflowY: "auto",
                marginBottom: 16,
              }}
            >
              {availableProducts.length === 0 ? (
                <p
                  style={{
                    textAlign: "center",
                    color: "var(--text-muted)",
                  }}
                >
                  All products are already in New Arrivals.
                </p>
              ) : (
                availableProducts.map((product) => (
                  <div
                    key={product.id}
                    style={{
                      padding: 12,
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      marginBottom: 8,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 500 }}>{product.name}</div>

                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--text-muted)",
                        }}
                      >
                        {product.attributes?.[0]?.sku || "—"}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-sm btn-gold"
                      onClick={() => handleAddToNewArrival(product.id)}
                      disabled={isAdding}
                    >
                      {isAdding ? "Adding..." : "Add"}
                    </button>
                  </div>
                ))
              )}
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowAddModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
