"use client";
import { useState, useEffect, createElement } from "react";
import { useParams, useRouter } from "next/navigation";
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
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
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
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { editCategory, deleteCategory } from "@/lib/tq-functions/categories.tq.functions";
import { editCategorySchema } from "@/lib/schema/categories.schema";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { icons } from "@/lib/icons";
import { SquareDashed } from "lucide-react";
import { Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoryByIDQueryOptions } from "@/lib/tq-options/categories.tq.options";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { transactionTypes } from "@/lib/data";
import { Textarea } from "@/components/ui/textarea";

export default function EditCategory() {
	const [isLoading, setIsLoading] = useState(false);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [activeTab, setActiveTab] = useState<string>("expense");
	const router = useRouter();
	const params = useParams();
	const queryClient = useQueryClient();
	const id = params.id as string;

	const form = useForm<z.infer<typeof editCategorySchema>>({
		resolver: zodResolver(editCategorySchema),
		defaultValues: {
			name: "",
			type: "",
			icon: "",
			description: "",
		}
	});

	const { mutate: editCategoryMutation } = useMutation({
		mutationFn: (values: z.infer<typeof editCategorySchema>) => editCategory(id, values),
		onMutate: () => {
			setIsLoading(true);
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: categoryByIDQueryOptions(id).queryKey,
			});
			toast.success(data.responseMessage);
			form.reset();
			router.push('/pages/settings');
		},
		onError: (error) => {
			toast.error(error.message);
		},
		onSettled: () => {
			setIsLoading(false);
		}
	});

	const { mutate: deleteCategoryMutation } = useMutation({
		mutationFn: (id: string) => deleteCategory(id),
		onMutate: () => {
			setIsLoading(true);    
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: categoryByIDQueryOptions(id).queryKey,
			});
			toast.success(data.responseMessage);
			router.push('/pages/settings');
		},
		onError: (error) => {
			toast.error(error.message);
		},
		onSettled: () => {
			setIsLoading(false);
		}
	});

	async function onSubmit(values: z.infer<typeof editCategorySchema>) {
		editCategoryMutation(values)
	};

	// Fetch category data
	const { data, isPending, error: categoryError } = useQuery(
		categoryByIDQueryOptions(id)
	);

	// Populate the form
	useEffect(() => {
		if (categoryError) {
			toast.error(categoryError.message);
		};
		if (!data || isPending) return;
		form.reset({
			name: data.name,
			icon: data.icon,
			description: data.description || '',
		});
		setActiveTab(data?.type?.toLowerCase());
	}, [categoryError, data, isPending]);

  // Set form value from Tab Selector
  useEffect(() => {
    if (
      activeTab
      && (activeTab === 'income'
      || activeTab === 'expense')
    ) {
      form.setValue('type', activeTab);
    }
  }, [activeTab, form]);

	useEffect(() => {
		if (form.formState.errors.type?.message) {
			toast.error(form.formState.errors.type?.message)
		}
	}, [form.formState.errors.type?.message]);

	return (
		<main className='flex flex-col space-y-4 p-3'>
			<div className="flex justify-between items-center">
				<TypographyH3 className="font-bold">
					Edit Category
				</TypographyH3>
				<Dialog>
					<DialogTrigger className="text-red-500" disabled={isLoading || isPending}>
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
								onClick={() => deleteCategoryMutation(id)}
							>
								Yes, I&apos;m sure
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="-mt-1">
				<TabsList className='bg-white border-2 w-full h-10'>
					{transactionTypes.map((type, index) => (
						<TabsTrigger
							value={type.toLowerCase()}
							key={index}
							className={`text-md
								${
									activeTab === 'expense'
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

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col space-y-4'>
					<FormField
						control={form.control}
						name="icon"
						render={({ field }) => (
							<FormItem className="m-auto mb-4 flex flex-col justify-center items-center">
								<FormLabel className="text-md font-medium">
									Category Icon
								</FormLabel>
								<FormControl>
									<div className="flex items-center gap-2">
										<Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
											<DrawerTrigger asChild>
												<div className="h-28 w-28 rounded-xl border-2 border-black bg-white cursor-pointer flex items-center justify-center">
													{field.value ? (
														createElement(icons[field.value as keyof typeof icons], { size: 60 })
													) : (
														<SquareDashed size={60} className="text-gray-400" />
													)}
												</div>
											</DrawerTrigger>
											<DrawerContent className="max-h-[80vh] p-4">
												<DrawerHeader>
													<DrawerTitle>Select an Icon</DrawerTitle>
												</DrawerHeader>
												<div className="w-full h-[60vh] overflow-y-auto p-2">
													<div className="grid grid-cols-4 gap-2">
														{Object.keys(icons).map((iconName) => (
															<div
																key={iconName}
																className="flex items-center justify-center"
																onClick={() => {
																	field.onChange(iconName);
																	setIsDrawerOpen(false);
																}}
															>
																<Card className="bg-primary border-2 w-full flex justify-center items-center text-white">
																	{createElement(icons[iconName as keyof typeof icons], { size: 32 })}
																</Card>
															</div>
														))}
													</div>
												</div>
											</DrawerContent>
										</Drawer>
									</div>
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
							onClick={() => router.back()}
							className="bg-red-500 border-2 hover:none"
							disabled={isLoading || isPending}
							type="button"
						>
							Cancel
						</Button>
						<Button
							className="border-2"
							type="submit"
							disabled={isLoading || isPending}
						>
							{isLoading ? "Submitting..." : "Update"}
						</Button>
					</div>
				</form>
			</Form>
		</main>
	);
};