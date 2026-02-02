'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  FileText,
  CreditCard,
  Archive,
} from 'lucide-react';

export function MainNav({ className, ...props }: HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();

  const routes = [
    {
      href: '/',
      label: 'Painel',
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      href: '/clients',
      label: 'Clientes',
      icon: <Users className="h-4 w-4" />,
    },
    {
      href: '/payments',
      label: 'Pagamentos',
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      href: '/invoices',
      label: 'Faturas',
      icon: <FileText className="h-4 w-4" />,
    },
    { href: '/plans', label: 'Planos', icon: <CreditCard className="h-4 w-4" /> },
    { href: '/estoque', label: 'Estoque', icon: <Archive className="h-4 w-4" /> },
  ];

  return (
    <nav
      className={cn('flex items-center space-x-4 lg:space-x-6', className)}
      {...props}
    >
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            'flex items-center text-sm font-medium transition-colors hover:text-primary',
            pathname === route.href
              ? 'text-primary'
              : 'text-muted-foreground'
          )}
        >
          <span className="mr-2">{route.icon}</span>
          {route.label}
        </Link>
      ))}
    </nav>
  );
}
