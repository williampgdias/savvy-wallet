import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWeeklyReminder } from '@/hooks/useWeeklyReminder';

export function PocketReminder() {
    const { show, dismiss } = useWeeklyReminder();

    if (!show) return null;

    const isThursday = new Date().getDay() === 4;

    return (
        <div className="flex items-start gap-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/20">
                <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                    {isThursday ? "It's payday Thursday!" : "Did you update your Pockets?"}
                </p>
                <p className="mt-0.5 text-sm text-amber-700/80 dark:text-amber-400/80">
                    Don't forget to deposit this week's transfers into your Pocket pots to keep your balance in sync.
                </p>
            </div>
            <Button
                variant="ghost"
                size="sm"
                onClick={dismiss}
                className="shrink-0 text-amber-700 hover:text-amber-900 hover:bg-amber-500/20 dark:text-amber-400 dark:hover:text-amber-200 h-8 px-3 text-xs font-semibold"
            >
                Done ✓
            </Button>
            <button
                onClick={dismiss}
                className="shrink-0 mt-0.5 text-amber-600/60 hover:text-amber-700 dark:text-amber-400/60 dark:hover:text-amber-400 transition-colors"
                aria-label="Dismiss"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
