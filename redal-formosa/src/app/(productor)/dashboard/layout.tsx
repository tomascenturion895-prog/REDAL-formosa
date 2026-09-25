import { DashboardTabs } from "@/components/productor/dashboard-tabs";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <DashboardTabs />
      {children}
    </div>
  );
}
