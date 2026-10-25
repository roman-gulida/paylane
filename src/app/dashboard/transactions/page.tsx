import type { Metadata } from "next";
import { TransactionsView } from "@/components/dashboard/transactions-view";
import { transactions } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Dashboard transactions",
  robots: { index: false },
};

export default function TransactionsPage() {
  return <TransactionsView base={transactions} />;
}
