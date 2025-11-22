"use client";
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Account } from '@/types/accounts.types';
import Link from 'next/link';
import Image from 'next/image';
import { useIsMobile } from "@/hooks/use-mobile"
import { fetchAccounts } from '@/store/accounts.store';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	TypographyH3,
} from "@/components/custom/typography";
import {
	Edit,
	Loader2,
	PlusIcon
} from 'lucide-react';
import {
	ContextMenu,
	ContextMenuTrigger
} from '../ui/context-menu';
import {
	ContextMenuContent,
	ContextMenuItem
} from '@radix-ui/react-context-menu';
import { useAccount } from '@/context/account-context';

function Navbar() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);
	const [open, setOpen] = useState(false);
	const pathname = usePathname();
	const [accounts, setAccounts] = useState<Account[]>([]);
	const { selectedAccountID, setSelectedAccount } = useAccount();
	const isMobile = useIsMobile();

	const disableSelect = [
		pathname.startsWith('/pages/accounts')
	].includes(true);

	const handleNewAccount = () => {
		setOpen(false)
		router.push('/pages/accounts/add')
	};

	const handleEdit = (id: string) => {
		setOpen(false);
		router.push(`/pages/accounts/${id}`);
	};

	const handleSelect = (id: string) => {
		setSelectedAccount(id);
		setOpen(false)
	};

	useEffect(() => {
		fetchAccounts()
			.then((accounts) => {
				setAccounts(accounts);
				setIsLoading(false);
			})
			.catch((error) => {
				if (error instanceof Error) {
					console.error(error.message)
					setIsLoading(false);
				};
			})
	}, [open]);

	return (
		<div className={`${isMobile ? 'px-0' : 'px-3'}`}>
			<nav
				className={`
					p-2
					w-full
					flex
					justify-between
					items-center
					bg-white border-black
					${isMobile ? 'border-b-2 rounded-none' : 'border-2 rounded-lg mt-2'}
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
				<Select
					open={open}
					onOpenChange={setOpen}
					disabled={disableSelect}
					onValueChange={handleSelect}
					value={selectedAccountID || ''}
				>
					<SelectTrigger
						className="w-[180px]
						bg-primary
						border-2 border-black
						max-w-[120px]
						text-sm"
					>
						<SelectValue placeholder="Accounts" />
					</SelectTrigger>

					<SelectContent className='border-2 border-black'>
						<SelectGroup>
							{isLoading ?
								<div className='flex flex-col justify-center'>
									<Loader2 className='w-full h-6 w-6 mt-1 mb-1 text-gray-600 animate-spin'/>
								</div>
							:
								<>
									{accounts && (
										<>
											{accounts.map((account, index) => (
												<ContextMenu key={index}>
													<ContextMenuTrigger>
														<SelectItem value={account.id}>
															{account.name}
														</SelectItem>
													</ContextMenuTrigger>
													<ContextMenuContent className='bg-primary rounded-md'>
														<ContextMenuItem 
															className="flex items-center px-2 py-1 text-sm cursor-pointer hover:bg-gray-100 rounded-sm"
																onClick={() => handleEdit(account.id)}
															>
															<Edit className="mr-2 h-4 w-4" />
															Edit
														</ContextMenuItem>
													</ContextMenuContent>
												</ContextMenu>
											))}										
										</>
									)}
								</>
							}
							<Button
								onClick={handleNewAccount}
								className='w-full text-white'
								disabled={isLoading}
							>
								<PlusIcon className='-mr-1' /> New Account
							</Button>
						</SelectGroup>
					</SelectContent>
				</Select>
			</nav>
		</div>
	)
};

export default Navbar;