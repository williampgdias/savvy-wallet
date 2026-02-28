import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ClerkProvider } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
    throw new Error('Missing Publishable Key');
}

createRoot(document.getElementById('root')!).render(
    <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        afterSignOutUrl="/"
        appearance={{
            baseTheme: dark,
            variables: {
                colorPrimary: '#3b82f6',
                colorBackground: '#020817',
            },
            elements: {
                card: 'border border-primary/20 shadow-xl',
                formButtonPrimary: 'font-bold',
            },
        }}
    >
        <App />
    </ClerkProvider>,
);
