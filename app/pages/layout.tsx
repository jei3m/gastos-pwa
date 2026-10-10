import Navbar from '@/components/custom/navbar';
import StickySidebar from '@/components/custom/sticky-sidebar';
import { Dock } from '@/components/custom/dock';
import { Toaster } from '@/components/ui/sonner';
import { Suspense } from 'react';
import Loader from '@/components/custom/loader';

export default function TransactionsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Suspense fallback={<Loader />}>
      <div className="w-full">
        <Navbar />
        <div className="grid grid-cols-1 justify-center gap-0 md:gap-3 md:grid-cols-[240px_minmax(0,1fr)] lg:grid-cols-[260px_minmax(0,650px)]">
          <StickySidebar />
          <main className="mx-auto w-full max-w-none md:max-w-[650px]">
            {children}
          </main>
        </div>
        <Toaster />
        <Dock showLabels={true} />
      </div>
    </Suspense>
  );
}
