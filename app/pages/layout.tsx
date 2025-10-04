import Navbar from "@/components/custom/navbar";
import { Dock } from "@/components/custom/dock";

export default function TransactionsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="max-w-[600px] m-auto">
      <Navbar/>
      {children}
      <Dock
        showLabels={true}
      />
    </div>
  );
};