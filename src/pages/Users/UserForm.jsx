import React, { useEffect, useState } from 'react';
import Modal from '../../components/Modal.jsx';
import { usersApi } from '../../api/users';
import { useToast } from '../../context/ToastContext.jsx';

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  password: ''
};

export default function UserForm({ user, onClose, onSaved }) {
  const toast = useToast();
  const isEdit = !!user;
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name ?? '',
        email: user.email ?? '',
        phone: user.phoneNo ?? '',
      });
    }
  }, [user]);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'First name is required';
    if (!form.phone.trim()) e.phone = 'Last name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (isEdit) {
        await usersApi.update(user.id, form);
        toast.success('Admin updated');
      } else {
        await usersApi.create(form);
        toast.success('Admin created');
      }
      onSaved();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Edit Admin' : 'Add Admin'} onClose={onClose} width="560px">
      <form onSubmit={handleSubmit}>
        <div className="field-row">
          <div className={`field${errors.name ? ' has-error' : ''}`}>
            <label>Name</label>
            <input value={form.name} onChange={(e) => update('name', e.target.value)} />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>
        </div>

        <div className="field-row">
          <div className={`field${errors.email ? ' has-error' : ''}`}>
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>
          <div className="field">
            <label>Phone</label>
            <input value={form.phone} onChange={(e) => update('phone', e.target.value)} />
          </div>
        </div>
        {!isEdit &&
          <div className="field-row">
            <div className={`field${errors.password ? ' has-error' : ''}`}>
              <label>Password</label>
              <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>
          </div>
          }

        {/* <div className="field">
          <label>Address</label>
          <textarea value={form.address} onChange={(e) => update('address', e.target.value)} />
        </div>

        <div className="field-row-3">
          <div className="field">
            <label>City</label>
            <input value={form.city} onChange={(e) => update('city', e.target.value)} />
          </div>
          <div className="field">
            <label>State</label>
            <input value={form.state} onChange={(e) => update('state', e.target.value)} />
          </div>
          <div className="field">
            <label>ZIP code</label>
            <input value={form.zipCode} onChange={(e) => update('zipCode', e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label>Country</label>
          <input value={form.country} onChange={(e) => update('country', e.target.value)} />
        </div> */}

        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" className="btn btn-gold" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create Admin'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
