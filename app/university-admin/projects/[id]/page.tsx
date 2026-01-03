/**
 * University Admin Project Details Page
 * Uses unified ProjectDetailsPage component
 */
"use client";

import { useParams } from "next/navigation";
import ProjectDetailsPage from "@/src/components/screen/projects/ProjectDetailsPage";

export default function UniversityAdminProjectDetailsPage() {
    const params = useParams();
    const projectId = params?.id as string;

    return <ProjectDetailsPage projectId={projectId} />;
}









