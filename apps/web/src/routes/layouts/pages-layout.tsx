import { Suspense } from 'react';
import { Outlet } from 'react-router';
import Navbar from '@/components/custom/navbar';
import StickySidebar from '@/components/custom/sticky-sidebar';
import { Dock } from '@/components/custom/dock';
import { Toaster } from '@/components/ui/toast';
import Loader from '@/components/custom/loader';

export default function PagesLayout() {
  return (
    <Suspense fallback={<Loader />}>
      <div className="w-full">
        <Navbar />
        <div className="grid grid-cols-1 justify-center gap-0 md:grid-cols-[240px_minmax(0,1fr)] md:gap-3 lg:grid-cols-[260px_minmax(0,650px)]">
          <StickySidebar />
          <main className="mx-auto w-full max-w-none md:max-w-[650px]">
            <Outlet />
          </main>
        </div>
        <Toaster />
        <Dock showLabels={true} />
      </div>
    </Suspense>
  );
}
