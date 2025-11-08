"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createAccount } from "@/store/accounts.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fetchSession } from "@/utils/session";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { TypographyH3 } from "@/components/custom/typography";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createAccountSchema } from "@/schema/acccounts.schema";

export default function CreateAccount() {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	// Validate user session
	useEffect(() => {
		fetchSession()
			.then(({session}) => {
				if (!session) {
					router.push('/auth/login')
				}
			})
	},[router])

	const form = useForm<z.infer<typeof createAccountSchema>>({
		resolver: zodResolver(createAccountSchema),
		defaultValues: {
			name: "",
			type: "",
			description: ""
		}
	})

	async function onSubmit(values: z.infer<typeof createAccountSchema>) {
		setIsLoading(true);
		
		createAccount(values)
			.then((account) => {
				router.push('/pages/transactions')
				console.log(account.responseMessage);
				setIsLoading(false);
			})
			.catch((error) => {
				console.error(error);
				setIsLoading(false);
			})
	}

	return (
		<main className='flex flex-col space-y-4 p-3'>
			<TypographyH3 className="font-bold text-center">
				Create New Account
			</TypographyH3>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col space-y-4'>
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
								<FormMessage />
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
									<Select onValueChange={field.onChange}>
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
							<FormItem className="-space-y-1">
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
								<FormMessage />
							</FormItem>
						)}
					/>
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
							type="submit" 
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