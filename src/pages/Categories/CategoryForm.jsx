import React, { useEffect, useState } from 'react';
import Modal from '../../components/Modal.jsx';
import { categoriesApi } from '../../api/categories';
import { useToast } from '../../context/ToastContext.jsx';

export default function CategoryForm({ category, onClose, onSaved }) {
  const toast = useToast();
  const isEdit = !!category;
  const [form, setForm] = useState({ name: '', description: '', image: '', collection: '', status: 'active' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (category) {
      setForm({
        name: category.name ?? '',
        description: category.description ?? '',
        image: category.image ?? '',
        collection: category.collection ?? '',
        status: category.status === 'active' ? 'active' : 'inactive'
      });
    }
  }, [category]);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setErrors({ name: 'Category name is required' });
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await categoriesApi.update(category.id, form);
        toast.success('Category updated');
      } else {
        await categoriesApi.create(form);
        toast.success('Category created');
      }
      onSaved();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Edit category' : 'Add category'} onClose={onClose} width="520px">
      <form onSubmit={handleSubmit}>
        <div className={`field${errors.name ? ' has-error' : ''}`}>
          <label>Name</label>
          <input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Silk Sarees" />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>
        <div className="field">
          <label>Description</label>
          <textarea value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Short description shown to customers" />
        </div>
        <div className={`field${errors.collection ? ' has-error' : ''}`}>
          <label>Collection</label>
          <select
            value={form.collection}
            onChange={(e) => update("collection", e.target.value)}
          >
            <option value="">Select Collection</option>
            <option value="SAREE">SAREE</option>
            <option value="JEWEL">JEWEL</option>
          </select>

          {errors.collection && (
            <span className="field-error">{errors.collection}</span>
          )}
        </div>
        <div className="field">
          <label>Image URL</label>
          <input value={form.image} onChange={(e) => update('image', e.target.value)} placeholder="https://…" />
        </div>
        <div className="field">
          <div className="checkbox-row">
            <input
              id="cat-active"
              type="checkbox"
              checked={form.status === 'active'}
              onChange={(e) => update('status', e.target.checked ? 'active' : 'inactive')}
            />
            <label htmlFor="cat-active" style={{ marginBottom: 0 }}>Active — visible to customers</label>
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" className="btn btn-gold" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create category'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
