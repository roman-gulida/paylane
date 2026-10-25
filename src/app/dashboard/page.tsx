import type { Metadata } from "next";
import { Overview } from "@/components/dashboard/overview";
import { transactions } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Dashboard overview",
  robots: { index: false },
};

export default function DashboardPage() {
  return <Overview base={transactions} />;
}
