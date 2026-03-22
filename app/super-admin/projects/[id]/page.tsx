"use client";

import { useParams } from "next/navigation";
import ProjectDetailsPage from "@/src/components/screen/projects/ProjectDetailsPage";

export default function SuperAdminProjectDetailsPage() {
  const params = useParams();
  const projectId = params?.id as string;

  return <ProjectDetailsPage projectId={projectId} />;
}
