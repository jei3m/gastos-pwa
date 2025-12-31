"use client";
import { TypographyH4, TypographyH5 } from "@/components/custom/typography";
import { Separator } from "@/components/ui/separator";
import { createAuthClient } from "better-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CalendarDays,
  User,
  LogOut,
  PlusIcon,
  CircleAlert,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAccount } from "@/context/account-context";
import PulseLoader from "@/components/custom/pulse-loader";
import { Skeleton } from "@/components/ui/skeleton";
import { Account } from "@/types/accounts.types";
import Link from "next/link";
import { categoryQueryOptions } from "@/lib/tq-options/categories.tq.options";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { categoryTypes } from "@/lib/data";
import { Tabs } from "@radix-ui/react-tabs";
import { Category } from "@/types/categories.types";
import CategoryCard from "@/components/categories/category-card";
import { Badge } from "@/components/ui/badge";

const authClient = createAuthClient();

export default function Settings() {
  const [activeTab, setActiveTab] = useState<string>("expense");
  const { data: session } = authClient.useSession();
  const isMobile = useIsMobile();
  const router = useRouter();
  const { accounts, isAccountsLoading, selectedAccountID } = useAccount();

  const handleLogout = async () => {
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
      const date =
        typeof dateString === "string" ? new Date(dateString) : dateString;
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  // Fetch categories
  const { data: categoriesData, isPending: isCategoriesLoading } = useQuery(
    categoryQueryOptions(activeTab!, selectedAccountID!)
  );
  const categories = useMemo(() => {
    return categoriesData?.[0]?.details;
  }, [categoriesData]);

  return (
    <main className={cn("space-y-6 px-3 mx-auto", isMobile ? "pb-20" : "pb-4")}>
      {/* User Section */}
      <section className={cn("space-y-4")}>
        {/* Profile Card */}
        <Card className={cn("border-2 mt-4")}>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex justify-between">
              <div className="flex gap-2 items-center">
                <User className="h-5 w-5" />
                User Information
              </div>
              {!isMobile && (
                <Button
                  variant="ghost"
                  className="text-red-500"
                  onClick={() => handleLogout()}
                >
                  <LogOut />
                  Log out
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <Separator className="-mt-5 mb-2" />
          <CardContent className="space-y-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex flex-col items-center justify-center">
                <Image
                  alt="Profile Picture"
                  src={session?.user?.image || "/icons/icons-96x96.png"}
                  width={80}
                  height={80}
                  className="rounded-full border-2 md:-mr-2"
                />
                {isMobile && (
                  <Button
                    variant="ghost"
                    className="text-red-500"
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
                  {session?.user?.name || "N/A"}
                </div>
              </div>
              <div className="space-y-1 text-left">
                <div className="flex items-center space-x-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Email
                  </div>
                  {session?.user?.emailVerified ? (
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-200 bg-green-50"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-amber-600 border-amber-200 bg-amber-50"
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Not Verified
                    </Badge>
                  )}
                </div>
                <div className="text-foreground font-medium">
                  {session?.user?.email || "N/A"}
                </div>
              </div>
            </div>
          </CardContent>
          <Separator className="mt-1 mb-2" />
          <CardFooter className="flex flex-col md:flex-row items-start gap-4 md:gap-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                <span>Account Created</span>
              </div>
              <div className="text-foreground font-medium">
                {session?.user?.createdAt
                  ? formatDate(session.user.createdAt)
                  : "N/A"}
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <CircleAlert className="h-4 w-4" />
                <span>Session Expiry</span>
              </div>
              <div className="text-foreground font-medium">
                {session?.session?.expiresAt
                  ? formatDate(session.session.expiresAt)
                  : "N/A"}
              </div>
            </div>
          </CardFooter>
        </Card>
      </section>

      {/* Accounts Section */}
      <section className={cn("space-y-4")}>
        <TypographyH5 className="font-semibold text-lg">Accounts</TypographyH5>
        <Separator className="-mt-2 bg-muted-foreground" />
        {isAccountsLoading ? (
          <PulseLoader />
        ) : (
          <>
            {accounts && accounts.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-2">
                {accounts.map((account: Account) => (
                  <Link href={`/pages/accounts/${account.id}`} key={account.id}>
                    <Card className="border-2 h-full">
                      <CardHeader>
                        <div className="flex flex-rows items-center justify-between">
                          <div className="text-xl font-bold">
                            {isAccountsLoading ? (
                              <Skeleton className="h-4 w-[140px] bg-gray-300" />
                            ) : (
                              account?.name
                            )}
                          </div>
                          <div className="text-md text-gray-600 font-normal">
                            {isAccountsLoading ? (
                              <Skeleton className="h-4 w-[140px] bg-gray-300" />
                            ) : (
                              account?.type
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <Separator className="-mt-2" />
                      <CardContent className="space-y-2 break-all">
                        {account.description}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>              
            ):(
							<div className="flex flex-col items-center justify-center py-10">
								<TypographyH4 className='text-gray-400 font-semibold text-center'>
									No Accounts
								</TypographyH4>
								<p className="text-gray-500 text-sm text-center">
									Start by adding your first account
								</p>
							</div>
            )}
            <Link className="w-full" href={"/pages/accounts/add"}>
              <Button className="w-full">
                <PlusIcon size={40} className="-mr-1" /> Add New Account
              </Button>
            </Link>
          </>
        )}
      </section>

      {/* Categories Section */}
      <section className={cn("space-y-4")}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center">
            <TypographyH4 className="font-semibold text-lg">
              Categories
            </TypographyH4>
            <TabsList
              defaultValue="expense"
              className="border-black border-2 p-1"
            >
              {categoryTypes.map((type, index) => (
                <TabsTrigger
                  value={type.toLowerCase()}
                  key={index}
                  className={`${
                    type === "Expense"
                      ? "data-[state=active]:bg-red-400"
                      : "data-[state=active]:bg-green-300"
                  }`}
                >
                  {type}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
        <Separator className="-mt-2 bg-muted-foreground" />
        {isCategoriesLoading ? (
          <PulseLoader />
        ) : (
          <>
            {categories && categories.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-2">
                {categories.map((category: Category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    hideAmount={true}
                    showDescription={true}
                  />
                ))}
              </div>
            ):(
							<div className="flex flex-col items-center justify-center py-10">
								<TypographyH4 className='text-gray-400 font-semibold text-center'>
									No Categories
								</TypographyH4>
								<p className="text-gray-500 text-sm text-center">
									Start by adding your first category
								</p>
							</div>
            )}
            <Link className="w-full" href={"/pages/categories/add"}>
              <Button className="w-full">
                <PlusIcon size={40} className="-mr-1" /> Add New Category
              </Button>
            </Link>
          </>
        )}
      </section>
    </main>
  );
};
