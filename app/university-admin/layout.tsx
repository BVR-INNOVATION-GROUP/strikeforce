import KYCRouteProtector from "@/src/components/base/KYCRouteProtector";
import RouteProtector from "@/src/components/base/RouteProtector";

export default function UniversityAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteProtector allowedRoles={["university-admin"]}>
      <KYCRouteProtector>{children}</KYCRouteProtector>
    </RouteProtector>
  );
}

