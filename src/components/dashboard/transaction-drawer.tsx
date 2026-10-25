"use client";

import { useState } from "react";
import { TransactionDetail } from "@/components/transactions/transaction-detail";
import { Drawer } from "@/components/ui/drawer";
import type { Transaction } from "@/lib/types";

/** Selection state for the detail drawer. The row stays set while the drawer animates closed */
export function useTransactionDrawer() {
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [open, setOpen] = useState(false);
  return {
    selectedId: open ? selected?.id : null,
    select(t: Transaction) {
      setSelected(t);
      setOpen(true);
    },
    drawer: (
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Transaction"
        description={selected?.id}
      >
        {selected && <TransactionDetail transaction={selected} />}
      </Drawer>
    ),
  };
}
