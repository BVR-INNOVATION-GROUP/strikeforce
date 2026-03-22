"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import Card from "@/src/components/core/Card";
import Button from "@/src/components/core/Button";
import Input from "@/src/components/core/Input";
import Modal from "@/src/components/base/Modal";
import Checkbox from "@/src/components/core/Checkbox";
import { adminRepository } from "@/src/repositories/adminRepository";
import { organizationRepository } from "@/src/repositories/organizationRepository";
import { useToast } from "@/src/hooks/useToast";
import { Palette, Plus, Pencil, Trash2, Building2, ArrowRightToLine } from "lucide-react";
import { BASE_URL } from "@/src/api/client";
import ConfirmationDialog from "@/src/components/base/ConfirmationDialog";

type OrgRow = { id: number; name: string; logo?: string; type: string };

function getOrgLogoUrl(logo?: string): string {
  const t = logo?.trim();
  if (!t) return "";
  return t.startsWith("http") ? t : `${BASE_URL}${t.startsWith("/") ? "" : "/"}${t}`;
}

function loginRowIsNameOnly(l: LoginLogo): boolean {
  return !l.logoUrl?.trim();
}

/** Org is represented on login: by URL match, or a name-only tile for orgs without logos. */
function isOrgLogoOnLogin(org: OrgRow, loginLogos: LoginLogo[]): boolean {
  const logoSrc = getOrgLogoUrl(org.logo);
  const nameOnlyOnLogin = loginLogos.some(
    (l) => l.name === org.name && loginRowIsNameOnly(l)
  );
  if (logoSrc) {
    const urlMatch = loginLogos.some((l) => l.logoUrl === logoSrc);
    return urlMatch || nameOnlyOnLogin;
  }
  return nameOnlyOnLogin;
}

function isOrgEligibleForLogin(org: OrgRow, loginLogos: LoginLogo[]): boolean {
  return !isOrgLogoOnLogin(org, loginLogos);
}

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
  const [organizations, setOrganizations] = useState<OrgRow[]>([]);
  const [addingFromOrg, setAddingFromOrg] = useState(false);
  const [selectedOrgIds, setSelectedOrgIds] = useState<Set<number>>(() => new Set());

  const refreshLoginLogos = useCallback(async () => {
    try {
      const data = await adminRepository.getLoginLogos();
      setLogos(Array.isArray(data) ? data : []);
    } catch {
      showError("Failed to load logos");
      setLogos([]);
    }
  }, [showError]);

  const loadLogosInitial = useCallback(async () => {
    try {
      setLoading(true);
      await refreshLoginLogos();
    } finally {
      setLoading(false);
    }
  }, [refreshLoginLogos]);

  const fetchOrgs = async () => {
    try {
      const orgs = await organizationRepository.getAll();
      setOrganizations(
        orgs.map((o) => ({
          id: o.id,
          name: o.name,
          logo: o.logo,
          type: o.type || "",
        }))
      );
    } catch {
      setOrganizations([]);
    }
  };

  useEffect(() => {
    loadLogosInitial();
    fetchOrgs();
  }, [loadLogosInitial]);

  /** Drop selections that are no longer eligible after logos refresh */
  useEffect(() => {
    setSelectedOrgIds((prev) => {
      const next = new Set<number>();
      prev.forEach((id) => {
        const org = organizations.find((o) => o.id === id);
        if (org && isOrgEligibleForLogin(org, logos)) next.add(id);
      });
      if (next.size === prev.size) {
        let same = true;
        prev.forEach((id) => {
          if (!next.has(id)) same = false;
        });
        if (same) return prev;
      }
      return next;
    });
  }, [organizations, logos]);

  const addOrgsToLogin = useCallback(
    async (orgs: OrgRow[]) => {
      const toAdd = orgs.filter((o) => isOrgEligibleForLogin(o, logos));
      if (toAdd.length === 0) {
        showError("Nothing to add — those organizations are already on the login page.");
        return;
      }
      setAddingFromOrg(true);
      let ok = 0;
      const failed: string[] = [];
      try {
        for (const org of toAdd) {
          const logoUrl = getOrgLogoUrl(org.logo);
          try {
            await adminRepository.createLoginLogo({
              name: org.name,
              logoUrl: logoUrl || "",
              altText: logoUrl ? `${org.name} logo` : `${org.name} (name on login)`,
            });
            ok += 1;
          } catch {
            failed.push(org.name);
          }
        }
        await refreshLoginLogos();
        if (ok > 0) {
          showSuccess(
            ok === 1
              ? `Moved ${toAdd[0].name} to the login page`
              : `Moved ${ok} organizations to the login page`
          );
        }
        if (failed.length > 0) {
          showError(`Could not add: ${failed.join(", ")}`);
        }
        setSelectedOrgIds(new Set());
      } finally {
        setAddingFromOrg(false);
      }
    },
    [logos, refreshLoginLogos, showError, showSuccess]
  );

  const handleAddFromOrg = async (org: OrgRow) => {
    await addOrgsToLogin([org]);
  };

  const eligibleOrgs = useMemo(
    () => organizations.filter((o) => isOrgEligibleForLogin(o, logos)),
    [organizations, logos]
  );

  const allEligibleSelected =
    eligibleOrgs.length > 0 && eligibleOrgs.every((o) => selectedOrgIds.has(o.id));

  const toggleSelectOrg = (org: OrgRow) => {
    if (!isOrgEligibleForLogin(org, logos)) return;
    setSelectedOrgIds((prev) => {
      const next = new Set(prev);
      if (next.has(org.id)) next.delete(org.id);
      else next.add(org.id);
      return next;
    });
  };

  const toggleSelectAllEligible = () => {
    if (eligibleOrgs.length === 0) return;
    if (allEligibleSelected) {
      setSelectedOrgIds(new Set());
      return;
    }
    setSelectedOrgIds(new Set(eligibleOrgs.map((o) => o.id)));
  };

  const handleAddSelectedToLogin = () => {
    const selected = organizations.filter((o) => selectedOrgIds.has(o.id));
    void addOrgsToLogin(selected);
  };

  const handleAddAllMissingToLogin = () => {
    void addOrgsToLogin(eligibleOrgs);
  };

  const handleSave = async () => {
    if (!form.name?.trim()) {
      showError("Name is required");
      return;
    }
    setSaving(true);
    try {
      if (editingLogo) {
        await adminRepository.updateLoginLogo(editingLogo.id, {
          name: form.name,
          logoUrl: form.logoUrl.trim(),
          altText: form.altText || undefined,
        });
        showSuccess("Logo updated");
      } else {
        await adminRepository.createLoginLogo({
          name: form.name,
          logoUrl: form.logoUrl.trim(),
          altText: form.altText || undefined,
        });
        showSuccess("Logo added");
      }
      setModalOpen(false);
      setEditingLogo(null);
      setForm({ name: "", logoUrl: "", altText: "" });
      await refreshLoginLogos();
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
      await refreshLoginLogos();
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

      <Card className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 size={20} />
          <h2 className="text-lg font-semibold">Organizations</h2>
        </div>
        <p className="text-sm text-secondary mb-4">
          Move any organization to the login page. If there is no logo yet, the org name appears as a text tile; you can add a URL later under Login Page Logos.
        </p>
        {organizations.length === 0 ? (
          <p className="text-sm text-secondary py-6 text-center">No organizations found.</p>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 mb-4 pb-4 border-b border-custom">
              <Checkbox
                label={
                  eligibleOrgs.length > 0
                    ? `Select all not on login (${eligibleOrgs.length})`
                    : "All organizations are already on login"
                }
                checked={allEligibleSelected}
                disabled={eligibleOrgs.length === 0 || addingFromOrg}
                onChange={() => toggleSelectAllEligible()}
                className="text-sm"
              />
              <div className="flex flex-wrap gap-2 sm:ml-auto">
                <Button
                  type="button"
                  className="bg-pale text-primary text-sm"
                  disabled={selectedOrgIds.size === 0 || addingFromOrg}
                  onClick={handleAddSelectedToLogin}
                >
                  <ArrowRightToLine size={16} className="mr-2 shrink-0" />
                  Move selected to login ({selectedOrgIds.size})
                </Button>
                <Button
                  type="button"
                  className="bg-primary text-sm"
                  disabled={eligibleOrgs.length === 0 || addingFromOrg}
                  onClick={handleAddAllMissingToLogin}
                >
                  <ArrowRightToLine size={16} className="mr-2 shrink-0" />
                  Move all missing to login
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {organizations.map((org) => {
                const hasLogo = Boolean(org.logo?.trim());
                const logoSrc = getOrgLogoUrl(org.logo);
                const onLogin = isOrgLogoOnLogin(org, logos);
                const eligible = isOrgEligibleForLogin(org, logos);
                const selected = selectedOrgIds.has(org.id);
                return (
                  <div
                    key={org.id}
                    className={`border border-custom rounded-lg p-4 flex flex-col gap-3 ${selected ? "ring-2 ring-primary/40" : ""}`}
                  >
                    <div className="flex items-start gap-2 w-full">
                      <div className="pt-0.5">
                        <Checkbox
                          checked={selected}
                          disabled={!eligible || addingFromOrg}
                          onChange={() => toggleSelectOrg(org)}
                          aria-label={`Select ${org.name}`}
                        />
                      </div>
                      <div className="flex-1 flex flex-col items-center gap-3 min-w-0">
                        <div className="w-24 h-16 bg-pale rounded flex items-center justify-center overflow-hidden">
                          {hasLogo ? (
                            <img
                              src={logoSrc}
                              alt={org.name}
                              className="max-w-full max-h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <Building2 className="w-9 h-9 text-secondary opacity-35" aria-hidden />
                          )}
                        </div>
                        <div className="w-full text-center min-w-0">
                          <span className="text-sm font-medium truncate block">{org.name}</span>
                          {org.type ? (
                            <span className="text-xs text-secondary capitalize">
                              {org.type.toLowerCase().replace("_", " ")}
                            </span>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleAddFromOrg(org)}
                          disabled={!eligible || addingFromOrg}
                          title={
                            onLogin
                              ? "Already on login page"
                              : hasLogo
                                ? "Add this organization’s logo to the login page"
                                : "Add organization name to the login page (logo optional)"
                          }
                          className="px-3 py-1.5 rounded-lg bg-pale text-primary text-xs font-medium disabled:opacity-50 w-full max-w-[11rem]"
                        >
                          {onLogin ? "On login" : "Move to login"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Palette size={20} />
          <h2 className="text-lg font-semibold">Login Page Logos</h2>
        </div>
        <p className="text-sm text-secondary mb-6">
          These entries appear on the login page. Rows without an image URL show the name only; add a URL anytime with edit.
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
                <div className="w-24 h-16 bg-pale rounded flex items-center justify-center overflow-hidden px-1">
                  {logo.logoUrl?.trim() ? (
                    <img
                      src={
                        logo.logoUrl.startsWith("http")
                          ? logo.logoUrl
                          : `${BASE_URL}${logo.logoUrl.startsWith("/") ? "" : "/"}${logo.logoUrl}`
                      }
                      alt={logo.altText || logo.name}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="text-[0.65rem] font-medium text-center text-secondary leading-tight line-clamp-3">
                      {logo.name}
                    </span>
                  )}
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
            title="Logo URL (optional)"
            value={form.logoUrl}
            onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
            placeholder="https://... (leave empty for name-only on login)"
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
