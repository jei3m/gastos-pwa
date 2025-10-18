"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { tabItems, categoryTypes } from '@/lib/data';
import { fetchSession } from '@/utils/session';
import { useIsMobile } from '@/hooks/use-mobile';

// ShadCN Components
import {
	Card,
	CardContent,
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
	ArrowDownLeft,
	ArrowUp,
	ArrowUpRight,
	Calendar,
	ChevronLeft,
	ChevronRight
} from 'lucide-react';
import { TypographyH4 } from '@/components/custom/typography';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function page() {
	const [activeTab, setActiveTab] = useState('weekly');
	const [categoryType, setCategoryType] = useState('expense');
	const [currentDate, setCurrentDate] = useState(new Date());
	const [userEmail, setUserEmail] = useState("");
	const router = useRouter();
	const isMobile = useIsMobile();

	// Validate user session
	// useEffect(() => {
	//     fetchSession().then(({ session }) => {
	//         if (!session) {
	//             router.push('/auth/login')
	//         }
	//         setUserEmail(session?.user.email ?? '');
	//     })
	// }, []);


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

	useEffect(() => {
		console.log(`Date Start: ${dateStart}`);
		console.log(`Date End: ${dateEnd}`);
	}, [activeTab])

	// Reset currentDate every tab change
	useEffect(() => {
		setCurrentDate(new Date())
	}, [activeTab])

	return (
		<main className={`flex flex-col space-y-4 min-h-screen
      ${isMobile ? 'pb-15' : 'pb-18'}
    `}>
			{/* Date Card Section */}
			<section
				className='
					pt-2 px-3 
					transition-all duration-150 
					ease-in-out'
			>
				<Card className="mt-0 border-2 ">
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
									10,100
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
									10,100
								</div>
							</div>
						</div>
					</CardFooter>
				</Card>
			</section>
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
			</section>
		</main>
	)
};