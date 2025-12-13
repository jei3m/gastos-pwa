"use client";
import { createElement, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { categoryTypes } from '@/lib/data';
import { useIsMobile } from '@/hooks/use-mobile';
import { Category } from '@/types/categories.types';
import { icons } from '@/lib/icons';
// ShadCN Components
import {
	Card,
	CardContent,
	CardDescription,
	CardTitle,
} from '@/components/ui/card';

import {
	Tabs,
	TabsList,
	TabsTrigger
} from "@/components/ui/tabs";

// Icon Imports
import {
	ArrowDown,
	ArrowUp,
	PlusIcon
} from 'lucide-react';
import { TypographyH4, TypographyH5 } from '@/components/custom/typography';
import { Button } from '@/components/ui/button';
import { fetchCategories } from '@/lib/store/categories.store';
import { toast } from 'sonner';
import Link from 'next/link';
import { useAccount } from '@/context/account-context';
import DateSelectCard from '@/components/custom/date-select-card';
import PulseLoader from '@/components/custom/pulse-loader';
import { formatAmount } from '@/utils/format-amount';

export default function Categories() {
  const [dateStart, setDateStart] = useState<string>('');
  const [dateEnd, setDateEnd] = useState<string>('');
	const [isLoading, setIsLoading] = useState(false);
	const [categoryType, setCategoryType] = useState('expense');
	const [categories, setCategories] = useState<Category[]>([]);
	const [totalIncome, setTotalIncome] = useState<string>("0.00");
	const [totalExpense, setTotalExpense] = useState<string>("0.00");
	const { selectedAccountID } = useAccount();
	const router = useRouter();
	const isMobile = useIsMobile();

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
    window.scroll(0, 0);
  }, []);

	// Convert string to React component
	const getIconComponent = (iconName: string) => {
		const iconKey = iconName;
		return icons[iconKey as keyof typeof icons];
	};

	// Returns true or false
	const isExpense = (type: string) => {
		return type === 'Expense';
	};

	const handleAddCategory = () => {
		router.push('/pages/categories/add');
	};

	// Function to handle previous or next 
  const handleDateRangeChange = (start: string, end: string) => {
    setDateStart(start);
    setDateEnd(end);
  };

  const calculateBalance = () => {
    if (!totalIncome || !totalExpense) return '0.00';

    const total = Number(totalIncome) - Number(totalExpense);

    return total.toFixed(2);
  };

	// Fetch categories when categoryType, router, or selectedAccountID changes
	useEffect(() => {
		if (selectedAccountID && categoryType && dateStart && dateEnd) {
			setIsLoading(true);
			fetchCategories(categoryType, selectedAccountID, dateStart, dateEnd)
				.then((categories) => {
					setTotalIncome(categories[0]?.totalIncome || "0.00");
					setTotalExpense(categories[0]?.totalExpense || "0.00");
					setCategories(categories[0]?.details || []);
				})
				.catch((error) => {
					if (error instanceof Error) {
						toast.error(error.message)
					} else {
						toast.error('Failed to Fetch Categories')
					};
				})
				.finally(() => {
					setIsLoading(false);
				})
		}
	}, [selectedAccountID, categoryType, dateStart, dateEnd]);

	return (
		<main className={`flex flex-col space-y-2 min-h-screen
      ${isMobile ? 'pb-15' : 'pb-18'}
    `}>
			{/* Date Card Section */}
			<DateSelectCard 
				onDateRangeChange={handleDateRangeChange}
				content={<>
					<div className='flex flex-col'>
						<h3 className='text-gray-600 font-normal text-lg'>
							Balance
						</h3>
						<h1 className='text-2xl font-extrabold'>
							PHP {formatAmount(calculateBalance())}
						</h1>
					</div>
					<div className='flex space-x-2'>
						<div className='
							bg-primary 
							w-[50%] flex flex-row
							justify-between items-center text-white
							border-2 rounded-xl h-16 container p-2'
						>
							<div>
								<ArrowDown size={32} />
							</div>
							<div className='text-right -space-y-1'>
								<div className='text-md'>
									Income
								</div>
								<div className='text-2xl font-bold'>
									{formatAmount(totalIncome)}
								</div>
							</div>
						</div>
						<div className='
							bg-red-500
							w-[50%] flex flex-row
							justify-between items-center text-white
							border-2 rounded-xl h-16 container p-2'
						>
							<div>
								<ArrowUp size={32} />
							</div>
							<div className='text-right -space-y-1'>
								<div className='text-md'>
									Expense
								</div>
								<div className='text-2xl font-bold'>
									{formatAmount(totalExpense)}
								</div>
							</div>
						</div>
					</div>
				</>}
			/>

			{/* Categories Section */}
			<section className='flex flex-col space-y-2 px-3 mb-2'>
				<Tabs defaultValue='expense' value={categoryType} onValueChange={setCategoryType}>
					<div className='flex flex-row justify-between items-center w-full'>
						<TypographyH4>
							Categories
						</TypographyH4>					
						<TabsList defaultValue="expense" className='border-black border-2 p-1'>
							{categoryTypes.map((type, index) => (
								<TabsTrigger
									value={type.toLowerCase()}
									key={index}
									className={`${
										type === 'Expense'
											? 'data-[state=active]:bg-red-400'
											: 'data-[state=active]:bg-green-300'
									}`}
								>
									{type}
								</TabsTrigger>
							))}
						</TabsList>
					</div>
				</Tabs>
				{isLoading ? (
						<PulseLoader />
					):(
						<>
							{categories && categories.length > 0 ? (
								<>
									{categories.map((category, index) => (
										<Link key={index} href={`/pages/categories/${category.id}`}>
											<Card className='border-2 p-[10px]'>
												<CardContent className='flex flex-row justify-between items-center -p-1'>
													<div className='flex flex-row space-x-2 items-center'>
														<div className={`
															p-1.5 rounded-lg border-2 
															${isExpense(category.type)
																? 'bg-red-500'
																: 'bg-primary'
															}
														`}>
															{createElement(getIconComponent(category.icon), { size: 30 })}									
														</div>
														<div>
															<TypographyH5 className='font-semibold'>
																{category.name}
															</TypographyH5>									
														</div>
													</div>
													<div className='text-right'>
														<CardDescription>
															Total Amount:
														</CardDescription>	
														<CardTitle
															className={`
																${
																	isExpense(category.type)
																		? 'text-red-500'
																		: 'text-primary'
																}
															`}
														>
															PHP {isExpense(category.type) ? '-' : '+'}{formatAmount(category.totalAmount) ?? 0.00}
														</CardTitle>										
													</div>
												</CardContent>
											</Card>
										</Link>
									))}
								</>
							) : (
								<div className="flex flex-col items-center justify-center py-10">
									<TypographyH4 className='text-gray-400 font-semibold text-center'>
										No Categories
									</TypographyH4>
									<p className="text-gray-500 text-sm text-center">
										Start by adding your first category
									</p>
								</div>
							)}
							<Button onClick={handleAddCategory}>
								<PlusIcon size={40} className='-mr-1'/> Add New Category
							</Button>
						</>				
				)}
			</section>
		</main>
	)
};