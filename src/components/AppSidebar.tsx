import {
    LayoutDashboard,
    List,
    Upload,
    LogOut,
    Wallet,
    Receipt,
    Target,
    PiggyBank,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from './ThemeToggle';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
    SidebarHeader,
    useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

const navItems = [
    { title: 'Dashboard', url: '/', icon: LayoutDashboard },
    { title: 'Transactions', url: '/transactions', icon: List },
    { title: 'Saving Pots', url: '/pots', icon: PiggyBank },
    { title: 'Import', url: '/import', icon: Upload },
];

export function AppSidebar() {
    const { signOut } = useAuth();
    const { state } = useSidebar();
    const collapsed = state === 'collapsed';

    return (
        <Sidebar collapsible="icon" className="border-r border-border/50">
            <SidebarHeader className="p-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                        <Wallet className="h-4 w-4" />
                    </div>
                    {!collapsed && (
                        <span className="text-lg font-semibold tracking-tight">
                            Finance
                        </span>
                    )}
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <NavLink
                                            to={item.url}
                                            end={item.url === '/'}
                                            className="flex items-center gap-3 rounded-xl px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                            activeClassName="bg-accent text-foreground font-medium"
                                        >
                                            <item.icon className="h-4 w-4 shrink-0" />
                                            {!collapsed && (
                                                <span>{item.title}</span>
                                            )}
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-3 space-y-1">
                <ThemeToggle />
            </SidebarFooter>
        </Sidebar>
    );
}
