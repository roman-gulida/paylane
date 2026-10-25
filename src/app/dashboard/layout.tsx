import { Sidebar, TopBar } from "@/components/dashboard/dashboard-nav";
import { MobileDemoFooter } from "@/components/dashboard/demo-controls";

export default function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <Sidebar />
      <TopBar />
      <div className="min-w-0 flex-1">
        <main id="main" className="px-4 py-6 sm:px-8 lg:px-10 lg:py-10">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
        <MobileDemoFooter />
      </div>
    </div>
  );
}
