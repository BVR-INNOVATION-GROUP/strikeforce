/**
 * Company Logos Horizontal Scroll Component
 * Displays company logos - fetches from API when available, falls back to defaults
 */
"use client";

import React, { useState, useEffect } from "react";
import { BASE_URL } from "@/src/api/client";

const defaultLogos = [
  { name: "MTN Uganda", logo: "https://cdn.worldvectorlogo.com/logos/mtn-new-logo.svg", alt: "MTN Uganda" },
  { name: "Flutterwave", logo: "https://cdn.worldvectorlogo.com/logos/flutterwave-1.svg", alt: "Flutterwave" },
  { name: "University of Schody", logo: "https://cdn.worldvectorlogo.com/logos/univ-schody.svg", alt: "University of Schody" },
  { name: "Bharti Airtel", logo: "https://cdn.worldvectorlogo.com/logos/bharti-airtel-limited.svg", alt: "Bharti Airtel" },
];

function resolveLogoUrl(logo: string): string {
  if (!logo) return "";
  if (logo.startsWith("http://") || logo.startsWith("https://")) return logo;
  return `${BASE_URL}${logo.startsWith("/") ? "" : "/"}${logo}`;
}

function mergeLogoLists(
  orgRows: { name: string; logoUrl: string }[],
  manualRows: { name: string; logoUrl: string; altText?: string }[]
): { name: string; logo: string; alt: string }[] {
  const seen = new Set<string>();
  const out: { name: string; logo: string; alt: string }[] = [];
  const add = (name: string, rawLogo: string, alt: string) => {
    const trimmed = rawLogo?.trim() ?? "";
    const logo = trimmed ? resolveLogoUrl(trimmed) : "";
    const key = logo
      ? `${name.trim().toLowerCase()}|${logo}`
      : `${name.trim().toLowerCase()}|_name_only_`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ name, logo, alt: alt || name });
  };
  orgRows.forEach((r) => add(r.name, r.logoUrl, r.name));
  manualRows.forEach((r) => add(r.name, r.logoUrl, r.altText || r.name));
  return out;
}

const CompanyLogosScroll: React.FC = () => {
  const [logos, setLogos] = useState<{ name: string; logo: string; alt: string }[]>(defaultLogos);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const [orgRes, loginRes] = await Promise.all([
          fetch(`${BASE_URL}/api/v1/organizations/public-logos`),
          fetch(`${BASE_URL}/api/v1/login-logos`),
        ]);
        const orgJson = orgRes.ok ? await orgRes.json().catch(() => ({})) : {};
        const loginJson = loginRes.ok ? await loginRes.json().catch(() => ({})) : {};
        const orgData = Array.isArray(orgJson?.data) ? orgJson.data : [];
        const loginData = Array.isArray(loginJson?.data) ? loginJson.data : [];
        const orgRows = orgData.map((l: { name: string; logoUrl: string }) => ({
          name: l.name,
          logoUrl: l.logoUrl,
        }));
        const manualRows = loginData.map((l: { name: string; logoUrl: string; altText?: string }) => ({
          name: l.name,
          logoUrl: l.logoUrl,
          altText: l.altText,
        }));
        const merged = mergeLogoLists(orgRows, manualRows);
        if (merged.length > 0) {
          setLogos(merged);
        }
      } catch {
        // Keep default logos on error
      }
    };
    fetchLogos();
  }, []);

  const handleImageError = (index: number) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }));
  };

  const displayLogos = [...logos, ...logos];

  return (
    <div className="w-full">
      <div className="mb-6">
        <p className="text-sm font-semibold text-white/80 mb-2">
          Trusted by leading organizations in Uganda
        </p>
        <p className="text-xs text-white/70">Partners using StrikeForce</p>
      </div>
      
      <div className="relative">
        {/* Gradient overlays for smooth scroll effect */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-paper to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-paper to-transparent z-10 pointer-events-none" />
        
        {/* Horizontal scrolling container */}
        <div className="overflow-hidden relative">
          <div className="flex gap-8 items-center min-w-max px-4 animate-scroll">
            {displayLogos.map((company, index) => (
              <div
                key={`${company.name}-${index}`}
                className="flex-shrink-0 w-32 h-20 bg-paper rounded-2xl border border-custom p-4 flex items-center justify-center"
                title={company.name}
              >
                {!company.logo || imageErrors[index] ? (
                  <div className="text-xs text-muted font-medium text-center px-2">
                    {company.name}
                  </div>
                ) : (
                  <img
                    src={company.logo}
                    alt={company.alt}
                    className="max-w-full max-h-full object-contain"
                    onError={() => handleImageError(index)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .animate-scroll {
          animation: scroll 25s linear infinite;
        }
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
};

export default CompanyLogosScroll;

