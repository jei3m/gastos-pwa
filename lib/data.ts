import { DockItem } from "@/types/dock.types";
import { ArrowLeftRight, Landmark, Settings, Tags } from "lucide-react";

export const tabItems = [{ value: "weekly" }, { value: "monthly" }, { value: "yearly" }];

export const categoryTypes = ["Expense", "Income"];

export const transactionTypes = ["Expense", "Income"];

export const menuItems: DockItem[] = [
  { 
    label: 'transactions', 
    icon: ArrowLeftRight, 
    route:'/pages/transactions' 
  },
  {
    label: 'accounts', 
    icon: Landmark, 
    route:'/pages/accounts' 
  },
  { 
    label: 'categories', 
    icon: Tags, 
    route:'/pages/categories' 
  },
  { 
    label: 'settings', 
    icon: Settings, 
    route:'/pages/settings' 
  },
];