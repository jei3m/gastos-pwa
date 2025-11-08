"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { TypographyH3 } from "@/components/custom/typography";
import { fetchSession } from "@/utils/session";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
	createAccountSchema, 
	updateAccountSchema 
} from "@/schema/acccounts.schema";
import { 
	deleteAccount, 
	editAccount, 
	fetchAccountByID 
} from "@/store/accounts.store";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Trash2 } from "lucide-react";

export default function EditAccount() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const router = useRouter();
	const params = useParams();
	const uuid = params.uuid as string;

	// Validate user session
	useEffect(() => {
		fetchSession()
			.then(({ session }) => {
				if (!session) {
					router.push('/auth/login')
				}
			})
	}, [router]);

	const form = useForm<z.infer<typeof createAccountSchema>>({
		resolver: zodResolver(createAccountSchema),
		defaultValues: {
			name: "",
			type: "",
			description: ""
		}
	});

	async function onSubmit(values: z.infer<typeof updateAccountSchema>) {
		setIsLoading(true);
		editAccount(uuid, values)
			.then((account) => {
				router.push('/pages/transactions')
				console.log(account.responseMessage);
				setIsLoading(false);				
			})
			.catch((error) => {
				setError(error.message)
				setIsLoading(false);
			})
	};

	const handleDelete = (uuid: string) => {
		setIsLoading(true);
		deleteAccount(uuid)
			.then(() => {
				router.push('/pages/transactions');
				setIsLoading(false);
			})
			.catch((error) => {
				setError(error.responseMessage);
				setIsLoading(false);
			})
	};

	useEffect(() => {
		setIsLoading(true);
		
		fetchAccountByID(uuid)
			.then((account) => {
				form.reset({
					name: account[0].name,
					type: account[0].type.toLowerCase(),
					description: account[0].description
				});
				setIsLoading(false);
			})
			.catch((error) => {
				setIsLoading(false);
				throw Error(error.responseMessage);
			})
	}, [uuid, form]);

	return (
		<main className='flex flex-col m-auto space-y-4 p-3 max-w-[500px]'>
			<div className="flex flex-row space-x-2 items-center">
				<TypographyH3 className="font-bold text-center">
					Edit Account
				</TypographyH3>
				<Dialog>
					<DialogTrigger className="text-red-500" disabled={isLoading}>
						<Trash2 size={20}/>
					</DialogTrigger>
					<DialogContent 
						className="border-2 bg-primary [&>button]:hidden"
						onOpenAutoFocus={(e) => e.preventDefault()}
					>
						<DialogHeader className="text-left">
							<DialogTitle>Are you sure?</DialogTitle>
							<DialogDescription className="text-gray-800">
								This action cannot be undone. It will be permanently deleted.
							</DialogDescription>
						</DialogHeader>
						<DialogFooter className="flex flex-row justify-between">
							<DialogClose asChild>
								<Button variant="outline" className="border-2">
									Cancel
								</Button>		
							</DialogClose>
							<Button 
								variant="destructive" 
								className="border-2"
								onClick={() => handleDelete(uuid)}
							>
								Yes, I&apos;m sure
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
			<Form {...form}>
				<form className='flex flex-col space-y-4' onSubmit={form.handleSubmit(onSubmit)}>
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem className="-space-y-1">
								<FormLabel className="text-md font-medium">
									Account Name
								</FormLabel>
								<FormControl>
									<Input
										required
										placeholder="Account Name..."
										{...field}
										className="h-9
										rounded-lg border-2
										border-black bg-white"
									/>
								</FormControl>
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="type"
						render={({ field }) => (
							<FormItem className="-space-y-1">
								<FormLabel className="text-md font-medium">
									Account Type
								</FormLabel>
								<FormControl>
									<Select value={field.value} onValueChange={field.onChange}>
										<SelectTrigger className="w-[180px] bg-white border-2 border-black w-full h-9">
											<SelectValue placeholder="Select Account Type..." />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="cash">Cash</SelectItem>
											<SelectItem value="digital">Digital</SelectItem>
										</SelectContent>
									</Select>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="description"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-md font-medium">
									Description
								</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Description..."
										{...field}
										className="h-9 
										rounded-lg border-2 
										border-black bg-white"
									/>
								</FormControl>
							</FormItem>
						)}
					/>
					{error && 
						<div className="text-red-500 font-medium">
							{error}
						</div>
					}
					<div className='flex flex-row justify-between'>
						<Button
							onClick={() => router.back()}
							className="bg-red-500 border-2 hover:none"
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button 
							className="border-2"
							disabled={isLoading}
						>
							{isLoading ? "Submitting..." : "Submit"}
						</Button>
					</div>
				</form>
			</Form>
		</main>
	);
};