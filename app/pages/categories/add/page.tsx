"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { createCategory } from "@/lib/tq-functions/categories.tq.functions";
import { createCategorySchema } from "@/lib/schema/categories.schema";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { transactionTypes } from "@/lib/data";
import { Textarea } from "@/components/ui/textarea";
import IconPicker from "@/components/custom/icon-picker";

export default function CreateCategory() {
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const router = useRouter();
	const queryClient = useQueryClient();

	const form = useForm<z.infer<typeof createCategorySchema>>({
		resolver: zodResolver(createCategorySchema),
		defaultValues: {
			name: "",
			type: "expense",
			icon: "",
			description: ""
		}
	});

	const {mutate: createCategoryMutation, isPending} = useMutation({
		mutationFn: (values: z.infer<typeof createCategorySchema>) => createCategory(values),
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: ['categories']
			});
			toast.success(data.responseMessage);
			form.reset();
			router.push('/pages/settings');
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	async function onSubmit(values: z.infer<typeof createCategorySchema>) {
		createCategoryMutation(values);
	};

	useEffect(() => {
		if (form?.formState?.errors?.type?.message) {
			toast.error(form?.formState?.errors?.type?.message);
			console.error(form?.formState?.errors?.type?.message);
		};
	}, [form?.formState?.errors?.type?.message]);

	return (
		<main className='flex flex-col space-y-4 p-3'>
			<TypographyH3 className="font-bold text-center">
				Create New Category
			</TypographyH3>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col space-y-4'>
					<FormField 
						control={form.control}
						name="type"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Tabs
										value={field.value.toLowerCase()} 
										onValueChange={field.onChange} 
										className="-mt-1"
									>
										<TabsList className='bg-white border-2 w-full h-10'>
											{transactionTypes.map((type, index) => (
												<TabsTrigger
													value={type.toLowerCase()}
													key={index}
													className={`text-md
														${
															field.value.toLowerCase() === 'expense'
																? 'data-[state=active]:bg-red-400'
																: 'data-[state=active]:bg-green-300'
														}`
													}
												>
													{type}
												</TabsTrigger>
											))}
										</TabsList>
									</Tabs>
								</FormControl>
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="icon"
						render={({ field }) => (
							<FormItem className="m-auto mb-4 flex flex-col justify-center items-center">
								<FormLabel className="text-md font-medium">
									Category Icon
								</FormLabel>
								<FormControl>
									<IconPicker
										value={field.value}
										onChange={field.onChange}
										type={form.watch('type')}
									/>
								</FormControl>
								<FormMessage className="text-center" />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem className="-space-y-1">
								<FormLabel className="text-md font-medium">
									Category Name
								</FormLabel>
								<FormControl>
									<Input
										required
										placeholder="Category Name..."
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
								<FormMessage />
              </FormItem>
            )}
          />
					<div className='flex flex-row justify-between'>
						<Button
							onClick={() => {
								form.reset();
								router.back();
							}}
							className="bg-red-500 border-2 hover:none"
							disabled={isPending}
							type="button"
						>
							Cancel
						</Button>
						<Button
							className="border-2"
							type="submit"
							disabled={isPending}
						>
							{isPending ? "Submitting..." : "Submit"}
						</Button>
					</div>
				</form>
			</Form>
		</main>
	);
};