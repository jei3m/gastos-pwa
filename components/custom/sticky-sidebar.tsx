'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { menuItems } from '@/lib/data';
import { cn } from '@/lib/utils';
import AccountSelector from '@/components/custom/account-selector';
import { Separator } from '@/components/ui/separator';
import { Card } from '../ui/card';

export default function StickySidebar() {
  const pathName = usePathname();

  return (
    <aside className="hidden md:block sticky top-[72px] self-start h-fit max-h-[calc(100svh-82px)] overflow-y-auto">
      <Card className="p-3 -space-y-2.5">
        <p className="px-2 text-sm font-medium text-muted-foreground">
          Account
        </p>
        <div className="mt-2">
          <AccountSelector />
        </div>
        <Separator className="my-3" />
        <p className="px-2 text-sm font-medium text-muted-foreground">
          Menu
        </p>
        <nav className="mt-2 flex flex-col gap-1">
          {menuItems.map((item) => {
            const isActive = pathName === item.route;
            return (
              <Link
                key={item.label}
                href={item.route}
                className={cn(
                  'flex items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground transition-colors hover:bg-muted-foreground/20',
                  isActive && 'bg-muted-foreground/20'
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>
                  {item.label[0].toUpperCase() +
                    item.label.slice(1)}
                </span>
              </Link>
            );
          })}
        </nav>
      </Card>
    </aside>
  );
}
