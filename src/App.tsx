import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Query, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import Index from './pages/Index';
import Import from './pages/Import';
import NotFound from './pages/NotFound';
import Transactions from './pages/Transactions';
import PotsPage from './pages/Pots';
import RecurringBills from './pages/RecurringBills';
import { SignedIn, SignedOut, SignIn, UserButton } from '@clerk/clerk-react';

const queryClient = new QueryClient();

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                        {/* If the user is not log in -- Only shows the login page -- */}
                        <SignedOut>
                            <div className="flex min-h-screen w-full items-center justify-center bg-muted/30">
                                <SignIn routing="hash" />
                            </div>
                        </SignedOut>

                        {/* If the user is log in -- Shows the all app -- */}
                        <SignedIn>
                            <div className="absolute top-4 right-4 z-50">
                                <UserButton afterSignOutUrl="/" />
                            </div>

                            <Routes>
                                <Route path="/" element={<Index />} />
                                <Route
                                    path="/transactions"
                                    element={<Transactions />}
                                />
                                <Route path="/pots" element={<PotsPage />} />
                                <Route
                                    path="/recurring-bills"
                                    element={<RecurringBills />}
                                />
                                <Route path="/import" element={<Import />} />
                                <Route path="*" element={<NotFound />} />
                            </Routes>
                        </SignedIn>
                    </BrowserRouter>
                </TooltipProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}
