"use client";
import { TypographyH5 } from '@/components/custom/typography';
import { Separator } from '@/components/ui/separator';
import { createAuthClient } from 'better-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, User, Clock, LogOut } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const authClient = createAuthClient();

export default function Settings() {
  const { data: session } = authClient.useSession();
  const isMobile = useIsMobile();
  const router = useRouter();

  const handleLogout = async() => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/auth/login"); 
        },
      },
    });
  };

  const formatDate = (dateString: string | Date) => {
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <main className='space-y-8 px-3 mx-auto'>
      {/* Account Section */}
      <section className={cn('space-y-4', isMobile && 'mt-2')}>

        {!isMobile && (
          <div>
            <TypographyH5 className='font-semibold text-lg mt-4'>
              Account Overview
            </TypographyH5>
            <Separator className='mt-2 bg-muted-foreground' />
          </div>          
        )}

        {/* Profile Card */}
        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex justify-between">
              <div className='flex gap-2 items-center'>
                <User className="h-5 w-5" />
                Account Information
              </div>
              {!isMobile && (
                <Button 
                  variant='ghost' 
                  className='text-red-500'
                  onClick={() => handleLogout()}
                >
                  <LogOut />
                  Log out
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <Separator className='-mt-5 mb-2'/>
          <CardContent className="space-y-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex flex-col items-center justify-center">
                <Image
                  alt='Profile Picture'
                  src={session?.user?.image || '/icons/icons-96x96.png'}
                  width={80}
                  height={80}
                  className='rounded-full border-2 md:-mr-2'
                />
                {isMobile && (
                  <Button 
                    variant='ghost' 
                    className='text-red-500'
                    onClick={() => handleLogout()}
                  >
                    <LogOut />
                    Log out
                  </Button>
                )}
              </div>
              <div className="space-y-1 text-left">
                <div className="text-sm font-medium text-muted-foreground">
                  Name
                </div>
                <div className="text-foreground font-medium">
                  {session?.user?.name || 'N/A'}
                </div>
              </div>
              <div className="space-y-1 text-left">
                <div className="text-sm font-medium text-muted-foreground">
                  Email
                </div>
                <div className="text-foreground font-medium">
                  {session?.user?.email || 'N/A'}
                </div>
              </div>
            </div>
          </CardContent>
          <Separator className='mt-1 mb-2'/>
          <CardFooter className='flex flex-col md:flex-row items-start gap-4 md:gap-10'>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                <span>Account Created</span>
              </div>
              <div className="text-foreground font-medium">
                {session?.user?.createdAt ? formatDate(session.user.createdAt) : 'N/A'}
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Last Updated</span>
              </div>
              <div className="text-foreground font-medium">
                {session?.user?.updatedAt ? formatDate(session.user.updatedAt) : 'N/A'}
              </div>
            </div>
          </CardFooter>
        </Card>
      </section>
    </main>
  );
};
