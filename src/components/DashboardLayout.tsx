import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';

export function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <AppSidebar />
                <main className="flex-1 overflow-auto">
                    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border/50 bg-background/80 px-6 backdrop-blur-lg">
                        <SidebarTrigger />
                    </header>
                    <div className="p-6">{children}</div>
                </main>
            </div>
        </SidebarProvider>
    );
}
