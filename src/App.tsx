import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import Index from './pages/Index';
import Import from './pages/Import';
import NotFound from './pages/NotFound';
import Transactions from './pages/Transactions';
import PotsPage from './pages/Pots';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    if (loading)
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    if (!user) return <Navigate to="/auth" replace />;
    return <>{children}</>;
}

const App = () => (
    <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                    <AuthProvider>
                        <Routes>
                            <Route
                                path="/"
                                element={
                                    <ProtectedRoute>
                                        <Index />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/transactions"
                                element={
                                    <ProtectedRoute>
                                        <Transactions />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/pots"
                                element={
                                    <ProtectedRoute>
                                        <PotsPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/import"
                                element={
                                    <ProtectedRoute>
                                        <Import />
                                    </ProtectedRoute>
                                }
                            />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </AuthProvider>
                </BrowserRouter>
            </TooltipProvider>
        </ThemeProvider>
    </QueryClientProvider>
);

export default App;
