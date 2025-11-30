"use client";
import { createElement, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { tabItems, categoryTypes } from '@/lib/data';
import { useIsMobile } from '@/hooks/use-mobile';
import { Category } from '@/types/categories.types';
import { icons } from '@/lib/icons';
// ShadCN Components
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
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
	Calendar,
	ChevronLeft,
	ChevronRight,
	PlusIcon
} from 'lucide-react';
import { TypographyH4, TypographyH5 } from '@/components/custom/typography';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { fetchCategories } from '@/store/categories.store';
import { toast } from 'sonner';
import Link from 'next/link';
import { useAccount } from '@/context/account-context';

export default function Categories() {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [activeTab, setActiveTab] = useState('weekly');
	const [categoryType, setCategoryType] = useState('expense');
	const [currentDate, setCurrentDate] = useState(new Date());
	const [categories, setCategories] = useState<Category[]>([]);
	const [totalIncome, setTotalIncome] = useState<string>("");
	const [totalExpense, setTotalExpense] = useState<string>("");
	const { selectedAccountID } = useAccount();
	const router = useRouter();
	const isMobile = useIsMobile();

	// Set isScrolled
	useEffect(() => {
		const onScroll = () => {
			setIsScrolled(window.scrollY > 40);
		};
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
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
	const handleDateChange = (direction: 'prev' | 'next') => {
		const newDate = new Date(currentDate);
		if (activeTab === 'daily') {
			newDate.setDate(
				newDate.getDate() + (direction === 'prev' ? -1 : 1)
			);
		} else if (activeTab === 'weekly') {
			newDate.setDate(
				newDate.getDate() + (direction === 'prev' ? -7 : 7)
			);
		} else {
			newDate.setMonth(
				newDate.getMonth() + (direction === 'prev' ? -1 : 1)
			);
		}
		setCurrentDate(newDate);
	};

	// Return dateStart, dateEnd, and dateDisplay
	const getDateRange = () => {
		const toISODate = (d: Date) => d.toISOString().slice(0, 10);
		const date = new Date(currentDate);

		if (activeTab === 'daily') {
			const dateStart = new Date(date),
				dateEnd = new Date(date);
			return {
				dateStart: toISODate(dateStart),
				dateEnd: toISODate(dateEnd),
				dateDisplay: dateStart.toLocaleDateString(
					'en-US',
					{
						month: 'long',
						day: 'numeric'
					}
				)
			}
		} else if (activeTab === 'weekly') {
			const dateStart = new Date(date),
				dayOfWeek = dateStart.getDay(),
				diff = dateStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1),
				dateEnd = new Date(dateStart);

			// Set dateStart and dateEnd
			dateStart.setDate(diff);
			dateEnd.setDate(dateStart.getDate() + 6);

			return {
				dateStart: toISODate(dateStart),
				dateEnd: toISODate(dateEnd),
				dateDisplay: `${dateStart.toLocaleDateString(
					'en-US',
					{
						month: 'long',
						day: 'numeric'
					})} - 
                    ${dateEnd.toLocaleDateString(
						'en-US',
						{
							month: 'long',
							day: 'numeric'
						}
					)}`
			}
		} else {
			const dateStart = new Date(
				Date.UTC(date.getFullYear(), date.getMonth(), 1)
			)
			const dateEnd = new Date(
				Date.UTC(date.getFullYear(), date.getMonth() + 1, 0)
			);

			return {
				dateStart: toISODate(dateStart),
				dateEnd: toISODate(dateEnd),
				dateDisplay: dateStart.toLocaleDateString(
					'en-US',
					{
						month: 'long',
						year: 'numeric',
						timeZone: 'UTC'
					}
				)
			};
		};
	};

	// Declaration of variables for filtering and display
	const { dateStart, dateEnd, dateDisplay } = getDateRange();

	// Reset currentDate every tab change
	useEffect(() => {
		setCurrentDate(new Date())
	}, [activeTab])

	// Fetch categories when categoryType, router, or selectedAccountID changes
	useEffect(() => {
		if (selectedAccountID) {
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
					}
				})
				.finally(() => {
					setIsLoading(false);
				})
		} else {
			toast.error("Please select an account first");
		}
	}, [categoryType, router, selectedAccountID, dateStart, dateEnd]);

	return (
		<main className={`flex flex-col space-y-2 min-h-screen
      ${isMobile ? 'pb-15' : 'pb-18'}
    `}>
			{/* Date Card Section */}
			{isScrolled ? (
				<section
          className={`sticky top-0 z-10 
            transition-all duration-150 
            ease-in-out
            ${isMobile ? 'px-0' : 'px-3'}
          `}
				>
					<Card className="rounded-none border-b-2">
						<CardHeader
							className='flex
								flex-col 
								justify-center 
								items-center -mt-2'
						>
							{/* Tabs Selection */}
							<div className='flex items-center gap-x-2'>
								<Calendar />
								<Tabs defaultValue='daily' value={activeTab} onValueChange={setActiveTab}>
									<TabsList className='bg-white'>
										{tabItems.map((item, index) => (
											<TabsTrigger
												value={item.value}
												key={index}
											>
												{/* Capitalized first letter of item.value */}
												{item.value.charAt(0).toUpperCase() + item.value.slice(1)}
											</TabsTrigger>
										))}
									</TabsList>
								</Tabs>
							</div>

							{/* Date Display and Date Change */}
							<div className='w-full'>
								<div className="flex 
									justify-between 
									items-center
									font-semibold"
								>
									<ChevronLeft
										className='cursor-pointer'
										onClick={() => handleDateChange('prev')}
									/>
									{dateDisplay}
									<ChevronRight
										className='cursor-pointer'
										onClick={() => handleDateChange('next')}
									/>
								</div>
							</div>
						</CardHeader>

						{/* Line Separator */}
						<Separator />

						<CardFooter className='w-full flex flex-row justify-center space-x-2'>
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
										{totalIncome || "0.00"}
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
										{totalExpense || "0.00"}
									</div>
								</div>
							</div>
						</CardFooter>
					</Card>
				</section>
			):(
				<section
					className='
						pt-2 px-3 
						transition-all duration-150 
						ease-in-out'
				>
					<Card className="mt-0 border-2">
						<CardHeader
							className='flex
								flex-col 
								justify-center 
								items-center -mt-2'
						>
							{/* Tabs Selection */}
							<div className='flex items-center gap-x-2'>
								<Calendar />
								<Tabs defaultValue='daily' value={activeTab} onValueChange={setActiveTab}>
									<TabsList className='bg-white'>
										{tabItems.map((item, index) => (
											<TabsTrigger
												value={item.value}
												key={index}
											>
												{/* Capitalized first letter of item.value */}
												{item.value.charAt(0).toUpperCase() + item.value.slice(1)}
											</TabsTrigger>
										))}
									</TabsList>
								</Tabs>
							</div>

							{/* Date Display and Date Change */}
							<div className='w-full'>
								<div className="flex 
									justify-between 
									items-center
									font-semibold"
								>
									<ChevronLeft
										className='cursor-pointer'
										onClick={() => handleDateChange('prev')}
									/>
									{dateDisplay}
									<ChevronRight
										className='cursor-pointer'
										onClick={() => handleDateChange('next')}
									/>
								</div>
							</div>
						</CardHeader>

						{/* Line Separator */}
						<Separator />

						<CardFooter className='flex flex-row justify-center space-x-2 -mx-1 -mb-1 '>
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
										{totalIncome || "0.00"}
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
										{totalExpense || "0.00"}
									</div>
								</div>
							</div>
						</CardFooter>
					</Card>
				</section>
			)}

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
								>
									{type}
								</TabsTrigger>
							))}
						</TabsList>
					</div>
				</Tabs>
				{isLoading ? (
						<div>Loading...</div>
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
															{isExpense(category.type) ? '-' : '+'} PHP {category.totalAmount ?? 0.00}
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