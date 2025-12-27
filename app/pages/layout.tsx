import Navbar from "@/components/custom/navbar";
import { Dock } from "@/components/custom/dock";
import { Toaster } from "@/components/ui/sonner";
import { Suspense } from "react";
import Loader from "@/components/custom/loader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";

export default function TransactionsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Suspense fallback={<Loader/>}>
      <SidebarProvider>
        <AppSidebar />
        <div className="w-full">
          <Navbar/>
          <div className="max-w-[800px] m-auto">
            {children}
          </div>
          <Toaster
            position="top-center"
            expand={false}
          />
          <Dock
            showLabels={true}
          />   
        </div>
      </SidebarProvider>
    </Suspense>
  );
};