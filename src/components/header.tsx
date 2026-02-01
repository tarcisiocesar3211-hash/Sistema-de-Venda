import { MainNav } from '@/components/main-nav';
import { UserNav } from '@/components/user-nav';
import { GanttChart } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <GanttChart className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block font-headline">
              Sales Glimpse
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <MainNav />
          </div>
          <nav className="flex items-center">
            <UserNav />
          </nav>
        </div>
      </div>
    </header>
  );
}

// Added Link for compilation, should be from next/link
import Link from 'next/link';
