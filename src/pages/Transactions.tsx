import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MonthYearFilter } from "@/components/MonthYearFilter";
import { TransactionsTable } from "@/components/TransactionsTable";
import { useTransactions } from "@/hooks/useTransactions";
import { Skeleton } from "@/components/ui/skeleton";

export default function Transactions() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const { data: transactions, isLoading } = useTransactions(month, year);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
            <p className="text-sm text-muted-foreground">All transactions for the selected period</p>
          </div>
          <MonthYearFilter month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
        </div>

        {isLoading ? (
          <Skeleton className="h-96 rounded-xl" />
        ) : (
          <TransactionsTable transactions={transactions ?? []} />
        )}
      </div>
    </DashboardLayout>
  );
}
