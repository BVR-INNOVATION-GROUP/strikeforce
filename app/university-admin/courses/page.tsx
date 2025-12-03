"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Legacy /courses route – navigation now flows through departments.
 * Redirect back to the departments list so admins can pick a department first.
 */
export default function LegacyUniversityAdminCourses() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/university-admin/departments");
  }, [router]);

  return (
    <div className="w-full flex flex-col min-h-full items-center justify-center p-8 text-center">
      <h1 className="text-xl font-semibold mb-2">Programmes moved</h1>
      <p className="text-sm text-secondary max-w-md">
        Programmes are now managed from inside each department. You&apos;re being redirected to the
        departments dashboard to pick a department first.
      </p>
    </div>
  );
}

