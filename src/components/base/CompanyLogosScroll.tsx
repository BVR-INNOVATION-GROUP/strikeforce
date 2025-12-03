/**
 * Company Logos Horizontal Scroll Component
 * Displays company logos from Uganda in a horizontal scrolling container
 */
"use client";

import React, { useState } from "react";

// Uganda company logos - using placeholder URLs that can be replaced with actual logos
const ugandaCompanies = [
  {
    name: "MTN Uganda",
    logo: "https://cdn.worldvectorlogo.com/logos/mtn-new-logo.svg",
    alt: "MTN Uganda"
  },
  {
    name: "Flutterwave",
    logo: "https://cdn.worldvectorlogo.com/logos/flutterwave-1.svg",
    alt: "Flutterwave"
  },
  {
    name: "University of Schody",
    logo: "https://cdn.worldvectorlogo.com/logos/univ-schody.svg",
    alt: "University of Schody"
  },
  {
    name: "Bharti Airtel",
    logo: "https://cdn.worldvectorlogo.com/logos/bharti-airtel-limited.svg",
    alt: "Bharti Airtel"
  }
];

const CompanyLogosScroll: React.FC = () => {
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const handleImageError = (index: number) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }));
  };

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
            {[...ugandaCompanies, ...ugandaCompanies].map((company, index) => (
              <div
                key={`${company.name}-${index}`}
                className="flex-shrink-0 w-32 h-20 bg-paper rounded-2xl border border-custom p-4 flex items-center justify-center"
                title={company.name}
              >
                {imageErrors[index] ? (
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

