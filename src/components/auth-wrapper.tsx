'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Header from '@/components/header';
import { useUser } from '@/firebase';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (isUserLoading) {
      return; // Wait for auth state to be determined
    }
    if (!user && pathname !== '/login') {
      router.replace('/login');
    }
  }, [pathname, router, user, isUserLoading]);

  if (isUserLoading) {
    return null; // Or a loading spinner
  }

  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <main className="flex-1">{children}</main>;
  }

  if (user) {
    return (
      <div className="relative flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  // If not authenticated and not on login page, show nothing (or loader) while redirecting
  return null;
}
