"use client";

import React, { useEffect, useState } from "react";
import Card from "@/src/components/core/Card";
import Button from "@/src/components/core/Button";
import Input from "@/src/components/core/Input";
import Modal from "@/src/components/base/Modal";
import { adminRepository } from "@/src/repositories/adminRepository";
import { organizationRepository } from "@/src/repositories/organizationRepository";
import { useToast } from "@/src/hooks/useToast";
import { Palette, Plus, Pencil, Trash2, Building2 } from "lucide-react";
import { BASE_URL } from "@/src/api/client";
import ConfirmationDialog from "@/src/components/base/ConfirmationDialog";

interface LoginLogo {
  id: number;
  name: string;
  logoUrl: string;
  altText?: string;
  sortOrder: number;
}

export default function BrandingPage() {
  const { showError, showSuccess } = useToast();
  const [logos, setLogos] = useState<LoginLogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLogo, setEditingLogo] = useState<LoginLogo | null>(null);
  const [form, setForm] = useState({ name: "", logoUrl: "", altText: "" });
  const [saving, setSaving] = useState(false);
  const [deleteLogo, setDeleteLogo] = useState<LoginLogo | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [organizations, setOrganizations] = useState<{ id: number; name: string; logo?: string; type: string }[]>([]);
  const [addingFromOrg, setAddingFromOrg] = useState(false);

  const fetchLogos = async () => {
    try {
      setLoading(true);
      const data = await adminRepository.getLoginLogos();
      setLogos(Array.isArray(data) ? data : []);
    } catch (error) {
      showError("Failed to load logos");
      setLogos([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrgs = async () => {
    try {
      const orgs = await organizationRepository.getAll();
      setOrganizations(orgs.filter((o) => o.logo).map((o) => ({ id: o.id, name: o.name, logo: o.logo, type: o.type || "" })));
    } catch {
      setOrganizations([]);
    }
  };

  useEffect(() => {
    fetchLogos();
    fetchOrgs();
  }, []);

  const handleAddFromOrg = async (org: { id: number; name: string; logo?: string }) => {
    if (!org.logo) return;
    setAddingFromOrg(true);
    try {
      await adminRepository.createLoginLogo({
        name: org.name,
        logoUrl: org.logo.startsWith("http") ? org.logo : `${BASE_URL}${org.logo.startsWith("/") ? "" : "/"}${org.logo}`,
        altText: `${org.name} logo`,
      });
      showSuccess(`Added ${org.name} to login page`);
      fetchLogos();
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to add logo");
    } finally {
      setAddingFromOrg(false);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.logoUrl) {
      showError("Name and logo URL are required");
      return;
    }
    setSaving(true);
    try {
      if (editingLogo) {
        await adminRepository.updateLoginLogo(editingLogo.id, {
          name: form.name,
          logoUrl: form.logoUrl,
          altText: form.altText || undefined,
        });
        showSuccess("Logo updated");
      } else {
        await adminRepository.createLoginLogo({
          name: form.name,
          logoUrl: form.logoUrl,
          altText: form.altText || undefined,
        });
        showSuccess("Logo added");
      }
      setModalOpen(false);
      setEditingLogo(null);
      setForm({ name: "", logoUrl: "", altText: "" });
      fetchLogos();
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteLogo) return;
    setDeleting(true);
    try {
      await adminRepository.deleteLoginLogo(deleteLogo.id);
      showSuccess("Logo deleted");
      setDeleteLogo(null);
      fetchLogos();
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const openEdit = (logo: LoginLogo) => {
    setEditingLogo(logo);
    setForm({ name: logo.name, logoUrl: logo.logoUrl, altText: logo.altText || "" });
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditingLogo(null);
    setForm({ name: "", logoUrl: "", altText: "" });
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col min-h-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Branding</h1>
          <p className="text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col min-h-full">
      <div className="flex-shrink-0 mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Branding</h1>
          <p className="text-secondary">Manage login page logos</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={openCreate} className="bg-primary">
            <Plus size={16} className="mr-2" />
            Add Manually
          </Button>
        </div>
      </div>

      {organizations.length > 0 && (
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={20} />
            <h2 className="text-lg font-semibold">Add from Organizations</h2>
          </div>
          <p className="text-sm text-secondary mb-4">
            Select an organization logo to add it to the login page.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {organizations.map((org) => {
              const alreadyAdded = logos.some((l) => l.logoUrl === org.logo || l.name === org.name);
              return (
                <div
                  key={org.id}
                  className="border border-custom rounded-lg p-4 flex flex-col items-center gap-3"
                >
                  <div className="w-24 h-16 bg-pale rounded flex items-center justify-center overflow-hidden">
                    <img
                      src={org.logo?.startsWith("http") ? org.logo : `${BASE_URL}${org.logo?.startsWith("/") ? "" : "/"}${org.logo}`}
                      alt={org.name}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium truncate w-full text-center">{org.name}</span>
                  <button
                    onClick={() => handleAddFromOrg(org)}
                    disabled={alreadyAdded || addingFromOrg}
                    className="px-3 py-1.5 rounded-lg bg-pale text-primary text-xs font-medium disabled:opacity-50"
                  >
                    {alreadyAdded ? "Added" : "Add to Login"}
                  </button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Palette size={20} />
          <h2 className="text-lg font-semibold">Login Page Logos</h2>
        </div>
        <p className="text-sm text-secondary mb-6">
          These logos appear on the login page. Add partner or university logos to build trust.
        </p>
        {logos.length === 0 ? (
          <p className="text-secondary py-8 text-center">No logos yet. Add your first logo above.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {logos.map((logo) => (
              <div
                key={logo.id}
                className="border border-custom rounded-lg p-4 flex flex-col items-center gap-3"
              >
                <div className="w-24 h-16 bg-pale rounded flex items-center justify-center overflow-hidden">
                  <img
                    src={logo.logoUrl}
                    alt={logo.altText || logo.name}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
                <span className="text-sm font-medium truncate w-full text-center">{logo.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(logo)}
                    className="p-2 rounded hover:bg-pale text-secondary"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteLogo(logo)}
                    className="p-2 rounded hover:bg-red-50 text-red-600"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={modalOpen}
        handleClose={() => {
          setModalOpen(false);
          setEditingLogo(null);
          setForm({ name: "", logoUrl: "", altText: "" });
        }}
        title={editingLogo ? "Edit Logo" : "Add Logo"}
        actions={[
          <Button key="cancel" onClick={() => setModalOpen(false)} className="bg-pale">
            Cancel
          </Button>,
          <Button key="save" onClick={handleSave} className="bg-primary" loading={saving}>
            {editingLogo ? "Update" : "Add"}
          </Button>,
        ]}
      >
        <div className="space-y-4">
          <Input
            title="Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Company or organization name"
          />
          <Input
            title="Logo URL *"
            value={form.logoUrl}
            onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
            placeholder="https://..."
          />
          <Input
            title="Alt text"
            value={form.altText}
            onChange={(e) => setForm({ ...form, altText: e.target.value })}
            placeholder="Accessibility description"
          />
        </div>
      </Modal>

      <ConfirmationDialog
        open={!!deleteLogo}
        onClose={() => setDeleteLogo(null)}
        onConfirm={handleDelete}
        title="Delete Logo"
        message={deleteLogo ? `Delete "${deleteLogo.name}"?` : ""}
        type="danger"
        confirmText="Delete"
        loading={deleting}
      />
    </div>
  );
}
