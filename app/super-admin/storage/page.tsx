"use client";

import React, { useEffect, useState } from "react";
import Card from "@/src/components/core/Card";
import { adminRepository } from "@/src/repositories/adminRepository";
import { HardDrive, RefreshCw } from "lucide-react";
import Skeleton from "@/src/components/core/Skeleton";

/**
 * Super Admin Storage - Cloudinary storage usage overview
 */
export default function SuperAdminStoragePage() {
  const [storageUsage, setStorageUsage] = useState<{
    configured: boolean;
    storage: number;
    bandwidth: number;
    resources: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStorageUsage = async () => {
    try {
      setLoading(true);
      const data = await adminRepository.getStorageUsage();
      setStorageUsage(data);
    } catch {
      setStorageUsage({ configured: false, storage: 0, bandwidth: 0, resources: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStorageUsage();
  }, []);

  if (loading) {
    return (
      <div className="w-full flex flex-col min-h-full">
        <div className="flex-shrink-0 mb-8">
          <Skeleton width={200} height={24} rounded="md" className="mb-2" />
          <Skeleton width={300} height={16} rounded="md" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-paper rounded-lg p-6">
              <Skeleton width={80} height={16} rounded="md" className="mb-2" />
              <Skeleton width={120} height={32} rounded="md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col min-h-full">
      <div className="flex-shrink-0 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[1rem] font-[600] mb-2">Storage</h1>
          <p className="text-[0.875rem] opacity-60">
            Cloudinary storage and bandwidth usage
          </p>
        </div>
        <button
          onClick={fetchStorageUsage}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium min-h-[44px] touch-manipulation"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <HardDrive size={24} />
          <span className="text-lg font-semibold">Cloudinary Storage</span>
        </div>
        {storageUsage?.configured ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-sm text-secondary mb-1">Storage Used</p>
              <p className="text-2xl font-semibold">
                {(storageUsage.storage / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-sm text-secondary mb-1">Bandwidth Used</p>
              <p className="text-2xl font-semibold">
                {(storageUsage.bandwidth / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-sm text-secondary mb-1">Resources</p>
              <p className="text-2xl font-semibold">
                {storageUsage.resources.toLocaleString()}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-secondary">
            Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME,
            CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in the backend
            environment.
          </p>
        )}
      </Card>
    </div>
  );
}
