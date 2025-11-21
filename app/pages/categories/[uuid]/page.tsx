"use client";
import { useState, useEffect, createElement } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { editCategory, fetchCategoryByID, deleteCategory } from "@/store/categories.store";
import { editCategorySchema } from "@/schema/categories.schema";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { icons } from "@/lib/icons";
import { SquareDashed } from "lucide-react";
import { Trash2 } from "lucide-react";

export default function EditCategory() {
	const [isLoading, setIsLoading] = useState(false);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [error, setError] = useState("");
	const router = useRouter();
	const params = useParams();
	const uuid = params.uuid as string;

	// Validate user session
	useEffect(() => {
		fetchSession()
			.then(({ session }) => {
				if (!session) {
					router.push('/auth/login');
				}
			})
	}, [router]);

	const form = useForm<z.infer<typeof editCategorySchema>>({
		resolver: zodResolver(editCategorySchema),
		defaultValues: {
			name: "",
			type: "",
			icon: ""
		}
	});

	async function onSubmit(values: z.infer<typeof editCategorySchema>) {
		setIsLoading(true);
		editCategory(uuid, values)
			.then((category) => {
				toast.success(category.responseMessage);
				router.push('/pages/categories');
			})
			.catch((error) => {
				toast.error(error.message);
			})
			.finally(() => {
				setIsLoading(false);
			})
	};

	const handleDelete = (uuid: string) => {
		setIsLoading(true);
		deleteCategory(uuid)
			.then(() => {
				router.push('/pages/categories');
				setIsLoading(false);
			})
			.catch((error) => {
				setError(error.message);
				setIsLoading(false);
			})
	};

	// Fetch category data and populate the form
	useEffect(() => {
		setIsLoading(true);
		fetchCategoryByID(uuid)
			.then((category) => {
				if (category && category.length > 0) {
					form.reset({
						name: category[0].name,
						type: category[0].type,
						icon: category[0].icon
					});
				}
				setIsLoading(false);
			})
			.catch((error) => {
				toast.error(error.message);
				setError(error.message);
				setIsLoading(false);
			})
	}, [uuid, form]);

	return (
		<main className='flex flex-col space-y-4 p-3'>
			<div className="flex flex-row space-x-2 justify-center items-center">
				<TypographyH3 className="font-bold">
					Edit Category
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
						name="type"
						render={({ field }) => (
							<FormItem className="-space-y-1">
								<FormLabel className="text-md font-medium">
									Category Type
								</FormLabel>
								<FormControl>
									<Select value={field.value} onValueChange={field.onChange}>
										<SelectTrigger className="w-[180px] bg-white border-2 border-black w-full h-9">
											<SelectValue placeholder="Select Category Type..." />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="Income">Income</SelectItem>
											<SelectItem value="Expense">Expense</SelectItem>
										</SelectContent>
									</Select>
								</FormControl>
								<FormMessage />
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
							type="button"
						>
							Cancel
						</Button>
						<Button
							className="border-2"
							type="submit"
							disabled={isLoading}
						>
							{isLoading ? "Submitting..." : "Update"}
						</Button>
					</div>
				</form>
			</Form>
		</main>
	);
};