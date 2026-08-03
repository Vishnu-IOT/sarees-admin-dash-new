import React, { useState } from 'react';
import Modal from './Modal.jsx';
import { IconAlert } from './icons.jsx';

export default function ConfirmDialog({
  title = 'Are you sure?',
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onClose
}) {
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={title} onClose={onClose} width="420px">
      <div className="confirm-icon danger">
        <IconAlert />
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: 13.5, lineHeight: 1.55 }}>{message}</p>
      <div className="form-actions">
        <button className="btn btn-outline" onClick={onClose} disabled={busy}>Cancel</button>
        <button className="btn btn-danger" onClick={handleConfirm} disabled={busy}>
          {busy ? 'Please wait…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
