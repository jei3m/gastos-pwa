"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useIsMobile } from "@/hooks/use-mobile"
import {
	TypographyH3,
} from "@/components/custom/typography";
import AccountSelector from './account-selector';

function Navbar() {
	const isMobile = useIsMobile();

	return (
		<div className={`${isMobile ? 'px-0' : 'pb-14'}`}>
			<nav
				className={`
					h-[50px]
					p-2
					flex
					justify-between
					items-center
					bg-white border-black
					${
						isMobile 
							? 'border-b-2 rounded-none' 
							: 'border-b-2 fixed top-0 w-full'
					}
				`}
			>
				<Link href={'/pages/transactions'}
					className='flex space-x-2 items-center'
				>
					<Image
						src='/icons/favicon.ico'
						alt='Gaston Icon'
						height={32}
						width={32}
					/>
					<TypographyH3>
						Gastos
					</TypographyH3>
				</Link>

				{/* Select Accounts Dropdown */}
				{isMobile && (
					<AccountSelector />
				)}
			</nav>
		</div>
	)
};

export default Navbar;