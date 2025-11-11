import KYCRouteProtector from "@/src/components/base/KYCRouteProtector";
import RouteProtector from "@/src/components/base/RouteProtector";

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteProtector allowedRoles={["partner"]}>
      <KYCRouteProtector>{children}</KYCRouteProtector>
    </RouteProtector>
  );
}

