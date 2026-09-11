import React, { useEffect, useState } from 'react';
import Modal from '../../components/Modal.jsx';
import { subcategoriesApi } from '../../api/subcategories';
import { useToast } from '../../context/ToastContext.jsx';

export default function SubcategoryForm({ subcategory, categories, onClose, onSaved }) {
  const toast = useToast();
  const isEdit = !!subcategory;
  const [form, setForm] = useState({ categoryId: '', name: '', description: '', image: '', status: 'active' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (subcategory) {
      setForm({
        categoryId: subcategory.categoryId ?? '',
        name: subcategory.name ?? '',
        description: subcategory.description ?? '',
        image: subcategory.image ?? '',
        status: subcategory.status === 'active' ? 'active' : 'inactive'
      });
    }
  }, [subcategory]);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const e = {};
    if (!form.categoryId) e.categoryId = 'Choose a parent category';
    if (!form.name.trim()) e.name = 'Subcategory name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...form, categoryId: Number(form.categoryId) };
      if (isEdit) {
        await subcategoriesApi.update(subcategory.id, payload);
        toast.success('Subcategory updated');
      } else {
        await subcategoriesApi.create(payload);
        toast.success('Subcategory created');
      }
      onSaved();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Edit subcategory' : 'Add subcategory'} onClose={onClose} width="520px">
      <form onSubmit={handleSubmit}>
        <div className={`field${errors.categoryId ? ' has-error' : ''}`}>
          <label>Parent category</label>
          <select value={form.categoryId} onChange={(e) => update('categoryId', e.target.value)}>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors.categoryId && <span className="field-error">{errors.categoryId}</span>}
        </div>
        <div className={`field${errors.name ? ' has-error' : ''}`}>
          <label>Name</label>
          <input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Kanjivaram" />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>
        {/* <div className="field">
          <label>Description</label>
          <textarea value={form.description} onChange={(e) => update('description', e.target.value)} />
        </div>
        <div className="field">
          <label>Image URL</label>
          <input value={form.image} onChange={(e) => update('image', e.target.value)} placeholder="https://…" />
        </div> */}
        <div className="field">
          <div className="checkbox-row">
            <input
              id="sub-active"
              type="checkbox"
              checked={form.status === 'active'}
              onChange={(e) => update('status', e.target.checked ? 'active' : 'inactive')}
            />
            <label htmlFor="sub-active" style={{ marginBottom: 0 }}>Active — visible to customers</label>
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" className="btn btn-gold" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create subcategory'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
