'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { UserProvider } from '@/contexts/UserContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { SupabaseProvider } from '@/contexts/SupabaseContext';

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
          <UserProvider>
            <SupabaseProvider>
              <SocketProvider>
                {children}
              </SocketProvider>
            </SupabaseProvider>
          </UserProvider>
        </Provider>
      </body>
    </html>
  );
}
