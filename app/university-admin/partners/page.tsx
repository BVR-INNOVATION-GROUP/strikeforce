/**
 * Partners on StrikeForce - Visibility Layer for Universities
 * Shows all partners with their activity and collaboration count
 */
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/src/components/core/Card";
import { organizationService } from "@/src/services/organizationService";
import { projectService } from "@/src/services/projectService";
import { OrganizationI } from "@/src/models/organization";
import { ProjectI } from "@/src/models/project";
import { Building2, Calendar, Briefcase, Filter } from "lucide-react";
import { BASE_URL } from "@/src/api/client";

export default function UniversityPartnersPage() {
  const [partners, setPartners] = useState<OrganizationI[]>([]);
  const [projects, setProjects] = useState<ProjectI[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterNewThisMonth, setFilterNewThisMonth] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [allOrgs, allProjects] = await Promise.all([
          organizationService.getAllOrganizations(),
          projectService.getAllProjects(),
        ]);

        // Filter for partners only
        const partnerOrgs = allOrgs.filter((org) => org.type === "PARTNER");
        setPartners(partnerOrgs);
        setProjects(allProjects.projects || []);
      } catch (error) {
        console.error("Failed to load partners:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Calculate activity for each partner
  const getPartnerActivity = (partnerId: number): {
    projectCount: number;
    recentActivity: string;
    collaborationCount: number;
  } => {
    if (!Array.isArray(projects)) {
      return {
        projectCount: 0,
        recentActivity: "No activity yet",
        collaborationCount: 0,
      };
    }
    const partnerProjects = projects.filter((p) => {
      const projectPartnerId = typeof p.partnerId === 'string' ? parseInt(p.partnerId, 10) : p.partnerId;
      const numericPartnerId = typeof partnerId === 'string' ? parseInt(partnerId, 10) : partnerId;
      return projectPartnerId === numericPartnerId;
    });
    const activeProjects = partnerProjects.filter((p) => p.status === "in-progress");

    return {
      projectCount: partnerProjects.length,
      recentActivity: activeProjects.length > 0
        ? `${activeProjects.length} active project${activeProjects.length !== 1 ? 's' : ''}`
        : partnerProjects.length > 0
          ? `${partnerProjects.length} project${partnerProjects.length !== 1 ? 's' : ''} posted`
          : "No activity yet",
      collaborationCount: partnerProjects.length, // Simplified - in production would count unique universities
    };
  };

  // Filter partners
  const filteredPartners = filterNewThisMonth
    ? partners.filter((partner) => {
      const createdAt = new Date(partner.createdAt);
      const now = new Date();
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      return createdAt >= oneMonthAgo;
    })
    : partners;

  if (loading) {
    return (
      <div className="w-full flex flex-col h-full overflow-hidden p-4">
        <p className="text-secondary">Loading partners...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col min-h-full">
      {/* Header */}
      <div className="flex-shrink-0 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-default mb-2">Partners on StrikeForce</h1>
            <p className="text-sm text-secondary">
              View all partner organizations and their activity on the platform
            </p>
          </div>
          <button
            onClick={() => setFilterNewThisMonth(!filterNewThisMonth)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${filterNewThisMonth
              ? "bg-primary text-white border-primary"
              : "bg-paper text-secondary border-custom hover-bg-very-pale"
              }`}
          >
            <Filter size={16} />
            <span className="text-sm font-medium">New this month</span>
          </button>
        </div>
      </div>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPartners.map((partner) => {
          const activity = getPartnerActivity(partner.id);
          const createdAt = new Date(partner.createdAt);
          const isNewThisMonth = (() => {
            const now = new Date();
            const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            return createdAt >= oneMonthAgo;
          })();

          return (
            <Link href={`/university-admin/partners/${partner.id}`}>
              <Card key={partner.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start gap-4 mb-4">
                  {partner.logo ? (
                    <img
                      src={partner.logo.startsWith("http") ? partner.logo : `${BASE_URL}/${partner.logo}`}
                      alt={partner.name}
                      className="w-16 h-16 object-contain rounded-lg border border-custom bg-paper p-2"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg border border-custom bg-pale flex items-center justify-center">
                      <Building2 size={24} className="text-muted-light" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-default truncate hover:text-primary transition-colors">
                        {partner.name}
                      </h3>
                      {isNewThisMonth && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                          New
                        </span>
                      )}
                    </div>
                    {partner.website && (
                      <a
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-muted hover:text-default hover:underline"
                      >
                        {partner.website.replace(/^https?:\/\//, '')}
                      </a>
                    )}
                  </div>
                </div>

                {/* Activity Snapshot */}
                <div className="space-y-3 pt-4 border-t border-custom">
                  <div className="flex items-center gap-2 text-sm text-secondary">
                    <Briefcase size={16} className="text-muted-light" />
                    <span>{activity.recentActivity}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-secondary">
                    <Calendar size={16} className="text-muted-light" />
                    <span>Joined {createdAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="pt-2">
                    <p className="text-xs text-muted">
                      <span className="font-semibold text-default">{activity.collaborationCount}</span> collaboration{activity.collaborationCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {filteredPartners.length === 0 && (
        <Card className="text-center py-12">
          <Building2 size={48} className="text-muted-light mx-auto mb-4" />
          <p className="text-secondary mb-2">No partners found</p>
          {filterNewThisMonth && (
            <button
              onClick={() => setFilterNewThisMonth(false)}
              className="text-sm text-secondary hover:text-default hover:underline"
            >
              Show all partners
            </button>
          )}
        </Card>
      )}
    </div>
  );
}

