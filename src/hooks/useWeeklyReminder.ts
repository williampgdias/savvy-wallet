import { useState, useEffect } from 'react';

function getWeekKey(): string {
    const now = new Date();
    const year = now.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const weekNum = Math.ceil(
        ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7,
    );
    return `pocket-reminder-${year}-w${weekNum}`;
}

function isReminderTime(): boolean {
    const now = new Date();
    const day = now.getDay(); // 0=Sun, 1=Mon, ..., 4=Thu, 5=Fri
    const hour = now.getHours();
    // Thursday from 18:00 onwards, or all day Friday
    return (day === 4 && hour >= 18) || day === 5;
}

export function useWeeklyReminder() {
    const [dismissed, setDismissed] = useState(() => {
        return localStorage.getItem(getWeekKey()) === 'dismissed';
    });

    useEffect(() => {
        // Re-check on mount in case localStorage changed
        setDismissed(localStorage.getItem(getWeekKey()) === 'dismissed');
    }, []);

    const dismiss = () => {
        localStorage.setItem(getWeekKey(), 'dismissed');
        setDismissed(true);
    };

    return {
        show: isReminderTime() && !dismissed,
        dismiss,
    };
}
