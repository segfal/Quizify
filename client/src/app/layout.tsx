'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/store/store';
import { UserProvider } from '@/contexts/UserContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { SupabaseProvider } from '@/contexts/SupabaseContext';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <UserProvider>
              <SupabaseProvider>
                <SocketProvider>
                  {children}
                  <Toaster position="top-right" />
                </SocketProvider>
              </SupabaseProvider>
            </UserProvider>
          </PersistGate>
        </Provider>
      </body>
    </html>
  );
}
