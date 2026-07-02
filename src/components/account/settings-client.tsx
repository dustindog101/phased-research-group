"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Save, Trash2, Plus, MapPin, Lock, Check } from "lucide-react";
import { US_STATES } from "@/lib/constants";

interface Address {
  id: string;
  fullName: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

interface Props {
  userEmail: string;
  userName: string;
  addresses: Address[];
}

export function AccountSettingsClient({ userEmail, userName, addresses: initialAddresses }: Props) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddr, setNewAddr] = useState({
    fullName: userName,
    line1: "",
    line2: "",
    city: "",
    state: "TX",
    zip: "",
    country: "US",
    phone: "",
    isDefault: false,
  });

  // Password change state
  const [pwdForm, setPwdForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwdLoading, setPwdLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    if (pwdForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setPwdLoading(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: pwdForm.currentPassword,
          newPassword: pwdForm.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success("Password changed");
      setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to change password");
    } finally {
      setPwdLoading(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddr.fullName || !newAddr.line1 || !newAddr.city || !newAddr.zip) {
      toast.error("Fill in all required fields");
      return;
    }
    try {
      const res = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddr),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setAddresses([...addresses, data.address]);
      setNewAddr({ ...newAddr, line1: "", line2: "", city: "", zip: "", phone: "", isDefault: false });
      setShowAddForm(false);
      toast.success("Address added");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add address");
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    try {
      const res = await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setAddresses(addresses.filter((a) => a.id !== id));
      toast.success("Address deleted");
    } catch {
      toast.error("Failed to delete address");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/account/addresses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      if (!res.ok) throw new Error("Failed");
      setAddresses(addresses.map((a) => ({ ...a, isDefault: a.id === id })));
      toast.success("Default address updated");
    } catch {
      toast.error("Failed to set default");
    }
  };

  return (
    <div className="space-y-8">
      {/* Account info */}
      <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-6">
        <h2 className="text-[16px] font-semibold uppercase tracking-[1.5px] mb-4" style={{ fontFamily: "var(--font-display)" }}>
          Account Information
        </h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-[var(--prg-border)]">
            <span className="text-[var(--prg-text-muted)]">Email</span>
            <span className="font-medium">{userEmail}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-[var(--prg-text-muted)]">Name</span>
            <span className="font-medium">{userName || "Not set"}</span>
          </div>
        </div>
      </div>

      {/* Password change */}
      <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-6">
        <h2 className="text-[16px] font-semibold uppercase tracking-[1.5px] mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
          <Lock size={16} /> Change Password
        </h2>
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-medium mb-1.5">Current Password</label>
            <input
              type="password"
              required
              value={pwdForm.currentPassword}
              onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
              className="w-full px-3 py-2.5 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm focus:outline-none focus:border-[var(--prg-accent)]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5">New Password</label>
            <input
              type="password"
              required
              value={pwdForm.newPassword}
              onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
              className="w-full px-3 py-2.5 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm focus:outline-none focus:border-[var(--prg-accent)]"
              placeholder="Min 8 characters"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5">Confirm New Password</label>
            <input
              type="password"
              required
              value={pwdForm.confirmPassword}
              onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
              className="w-full px-3 py-2.5 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm focus:outline-none focus:border-[var(--prg-accent)]"
            />
          </div>
          <button
            type="submit"
            disabled={pwdLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--prg-accent)] text-white text-xs font-medium uppercase tracking-[1.5px] rounded-[var(--prg-radius)] hover:bg-[var(--prg-accent-hover)] disabled:opacity-50"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {pwdLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Update Password
          </button>
        </form>
      </div>

      {/* Address book */}
      <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-semibold uppercase tracking-[1.5px] flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
            <MapPin size={16} /> Saved Addresses
          </h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 text-xs font-medium text-[var(--prg-accent)] hover:underline"
          >
            <Plus size={14} /> Add Address
          </button>
        </div>

        {showAddForm && (
          <div className="mb-4 p-4 bg-[var(--prg-bg-alt)] rounded-[var(--prg-radius)] space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Full Name *"
                value={newAddr.fullName}
                onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                className="px-3 py-2 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm"
              />
              <input
                type="text"
                placeholder="Phone"
                value={newAddr.phone}
                onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                className="px-3 py-2 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm"
              />
              <input
                type="text"
                placeholder="Address Line 1 *"
                value={newAddr.line1}
                onChange={(e) => setNewAddr({ ...newAddr, line1: e.target.value })}
                className="md:col-span-2 px-3 py-2 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm"
              />
              <input
                type="text"
                placeholder="Address Line 2"
                value={newAddr.line2}
                onChange={(e) => setNewAddr({ ...newAddr, line2: e.target.value })}
                className="md:col-span-2 px-3 py-2 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm"
              />
              <input
                type="text"
                placeholder="City *"
                value={newAddr.city}
                onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                className="px-3 py-2 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm"
              />
              <select
                value={newAddr.state}
                onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                className="px-3 py-2 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm"
              >
                {US_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="ZIP *"
                value={newAddr.zip}
                onChange={(e) => setNewAddr({ ...newAddr, zip: e.target.value })}
                className="px-3 py-2 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={newAddr.isDefault}
                  onChange={(e) => setNewAddr({ ...newAddr, isDefault: e.target.checked })}
                  className="accent-[var(--prg-accent)]"
                />
                Set as default
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddAddress}
                className="px-4 py-2 bg-[var(--prg-accent)] text-white text-xs font-medium uppercase tracking-[1px] rounded-[var(--prg-radius)] hover:bg-[var(--prg-accent-hover)]"
              >
                Save Address
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-[var(--prg-border)] text-xs font-medium uppercase tracking-[1px] rounded-[var(--prg-radius)]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {addresses.length === 0 ? (
          <p className="text-sm text-[var(--prg-text-muted)] py-6 text-center">
            No saved addresses yet.
          </p>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`p-4 border rounded-[var(--prg-radius)] ${
                  addr.isDefault ? "border-[var(--prg-accent)] bg-[rgba(30,58,95,0.02)]" : "border-[var(--prg-border)]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {addr.isDefault && (
                      <span className="prg-badge prg-badge--teal text-[9px] py-0.5 px-2 mb-2">Default</span>
                    )}
                    <p className="text-sm font-medium">{addr.fullName}</p>
                    <p className="text-xs text-[var(--prg-text-muted)]">{addr.line1}</p>
                    {addr.line2 && <p className="text-xs text-[var(--prg-text-muted)]">{addr.line2}</p>}
                    <p className="text-xs text-[var(--prg-text-muted)]">
                      {addr.city}, {addr.state} {addr.zip}
                    </p>
                    {addr.phone && <p className="text-xs text-[var(--prg-text-muted)]">{addr.phone}</p>}
                  </div>
                  <div className="flex flex-col gap-1">
                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefault(addr.id)}
                        className="text-[10px] text-[var(--prg-accent)] hover:underline uppercase tracking-[1px]"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-[var(--prg-text-muted)] hover:text-[var(--prg-danger)]"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
