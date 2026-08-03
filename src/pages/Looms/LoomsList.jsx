import React, { useState } from 'react';
import Topbar from '../../components/Topbar.jsx';
import { Loader, EmptyState } from '../../components/Loader.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useData } from '../../context/DataContext.jsx';
import { IconPlus, IconTrash } from '../../components/icons.jsx';
import Badge from '../../components/Badge.jsx';

export default function LoomsList() {
  const toast = useToast();
  const {
    looms,
    loomsLoading,
    products,
    addToLoom,
    removeLoom,
    fetchLooms,
  } = useData();

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const filtered = (looms || [])
    .filter((l) => !search || l.name?.toLowerCase().includes(search.toLowerCase()) || l.sku?.toLowerCase().includes(search.toLowerCase()));

  const handleRemove = async (loom) => {
    if (window.confirm(`Remove "${loom.name}" from the Direct-from-Loom collection?\n\nThis only un-tags it from Loom — the product itself will NOT be deleted.`)) {
      try {
        await removeLoom(loom.id);
        toast.success('Removed from Direct-from-Loom collection');
      } catch (err) {
        toast.error(err.message || 'Failed to remove product from loom collection');
      }
    }
  };

  const handleAddToLoom = async (productId) => {
    setIsAdding(true);
    try {
      await addToLoom(productId);
      toast.success('Added to Direct-from-Loom collection');
      setShowAddModal(false);
    } catch (err) {
      toast.error(err.message || 'Failed to add product to loom collection');
    } finally {
      setIsAdding(false);
    }
  };

  const availableProducts = (products || []).filter(p => !looms.some(l => l.id === p.id));

  return (
    <>
      <Topbar
        eyebrow="Catalogue"
        title="Direct-from-Loom"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or SKU…"
      />
      <div className="page">
        <div className="page-header">
          <div>
            <h2>Direct-from-Loom Collection</h2>
            <p>Exquisite handloom sarees & artisan weaver products crafted directly at master looms.</p>
            <p style={{ marginTop: 8, fontSize: 13, color: 'var(--text-muted)' }}>
              {filtered.length} items in collection
            </p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-gold" onClick={() => setShowAddModal(true)}>
              <IconPlus /> Add to Loom
            </button>
          </div>
        </div>

        <div className="table-wrap">
          {loomsLoading ? (
            <Loader />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={IconPlus}
              title="No loom products yet"
              message="Tag existing products as direct-from-loom items."
              action={<button className="btn btn-gold btn-sm" onClick={() => setShowAddModal(true)}><IconPlus /> Add to Loom</button>}
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
                  {filtered.map((loom, idx) => (
                    <tr key={loom.id}>
                      <td className="cell-mono">{idx + 1}</td>
                      <td>
                        <div className="cell-primary">{loom.name}</div>
                      </td>
                      <td className="cell-mono">{loom.sku}</td>
                      <td><Badge value={loom.status === 'active' ? 'active' : 'inactive'} label={loom.status === 'active' ? 'Active' : 'Inactive'} /></td>
                      <td>
                        <div className="row-actions">
                          <button
                            className="icon-btn danger"
                            onClick={() => handleRemove(loom)}
                            aria-label="Remove from loom"
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

      {showAddModal && (
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
            <h3 style={{ marginBottom: 16 }}>Add to Direct-from-Loom Collection</h3>
            <p style={{ marginBottom: 16, fontSize: 13, color: 'var(--text-muted)' }}>
              Select products to tag as direct-from-loom items.
            </p>

            <div style={{ maxHeight: 400, overflowY: 'auto', marginBottom: 16 }}>
              {availableProducts.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>All products are already in the loom collection.</p>
              ) : (
                availableProducts.map(product => (
                  <div
                    key={product.id}
                    style={{
                      padding: 12,
                      border: '1px solid var(--border)',
                      borderRadius: 6,
                      marginBottom: 8,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 500 }}>{product.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{product.sku}</div>
                    </div>
                    <button
                      className="btn btn-sm btn-gold"
                      onClick={() => handleAddToLoom(product.id)}
                      disabled={isAdding}
                    >
                      {isAdding ? 'Adding...' : 'Add'}
                    </button>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowAddModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
