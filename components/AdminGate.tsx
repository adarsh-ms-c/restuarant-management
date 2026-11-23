"use client";

import { useState } from "react";
import { ADMIN_PASSWORD } from "@/lib/config";

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

export default function AdminGate({ onClose, onSuccess }: Props) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password === ADMIN_PASSWORD) {
      onSuccess();
      return;
    }
    setError("Incorrect password. Try again.");
    setPassword("");
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-title"
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-5">
          <h2 id="admin-title" className="text-lg font-semibold text-slate-900">Admin access</h2>
          <p className="mt-1 text-sm text-slate-500">Enter the admin password to open the dashboard.</p>
        </div>
        <form onSubmit={handleSubmit}>
          <label htmlFor="admin-password" className="mb-1 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError("");
            }}
            className="input"
            placeholder="Enter admin password"
            autoComplete="current-password"
            autoFocus
          />
          {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Unlock</button>
          </div>
        </form>
      </div>
    </div>
  );
}
