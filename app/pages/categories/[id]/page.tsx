'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TypographyH3 } from '@/components/custom/typography';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import {
  editCategory,
  deleteCategory,
} from '@/lib/tq-functions/categories.tq.functions';
import { editCategorySchema } from '@/lib/schema/categories.schema';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { categoryByIDQueryOptions } from '@/lib/tq-options/categories.tq.options';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { categoryTypes } from '@/lib/data';
import { Textarea } from '@/components/ui/textarea';
import IconPicker from '@/components/custom/icon-picker';
import CustomAlertDialog from '@/components/custom/custom-alert-dialog';

export default function EditCategory() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const form = useForm<z.infer<typeof editCategorySchema>>({
    resolver: zodResolver(editCategorySchema),
    defaultValues: {
      name: '',
      type: '',
      icon: '',
      description: '',
    },
  });

  const transactionType = useWatch({
    control: form.control,
    name: 'type',
  });

  const { mutate: editCategoryMutation } = useMutation({
    mutationFn: (
      values: z.infer<typeof editCategorySchema>
    ) => editCategory(id, values),
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
    },
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
    },
  });

  async function onSubmit(
    values: z.infer<typeof editCategorySchema>
  ) {
    editCategoryMutation(values);
  }

  // Fetch category data
  const {
    data,
    isPending,
    error: categoryError,
  } = useQuery(categoryByIDQueryOptions(id));

  // Populate the form
  useEffect(() => {
    if (categoryError) {
      toast.error(categoryError.message);
    }
    if (!data || isPending) return;
    form.reset({
      name: data.name,
      icon: data.icon,
      type: data.type || 'expense',
      description: data.description || '',
    });
  }, [categoryError, data, isPending, form]);

  useEffect(() => {
    if (form?.formState?.errors?.type?.message) {
      toast.error(form?.formState?.errors?.type?.message);
      console.error(form?.formState?.errors?.type?.message);
    }
  }, [form?.formState?.errors?.type?.message]);

  return (
    <main className="flex flex-col space-y-4 p-3">
      <div className="flex justify-between items-center">
        <TypographyH3>
          Edit Category
        </TypographyH3>
        <CustomAlertDialog
          isDisabled={isLoading || isPending}
          trigger={
            <Trash2 size={20} className="text-red-500" />
          }
          title="Are you sure?"
          description={
            <>
              This will permanently delete this category.{' '}
              <br /> <br />
              If there are existing transactions associated
              with this category, please delete them first.
            </>
          }
          confirmMessage="Yes, I'm sure"
          onConfirm={() => deleteCategoryMutation(id)}
        />
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col space-y-4"
        >
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
                    <TabsList className="bg-white border-2 w-full h-10">
                      {categoryTypes.map(
                        (type, index) => (
                          <TabsTrigger
                            value={type.toLowerCase()}
                            key={index}
                            className={`text-md
														${
                              field.value.toLowerCase() ===
                              'expense'
                                ? 'data-[state=active]:bg-red-400'
                                : 'data-[state=active]:bg-green-300'
                            }`}
                          >
                            {type}
                          </TabsTrigger>
                        )
                      )}
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
                    type={transactionType}
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
          <div className="flex flex-row justify-between">
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
              {isLoading ? 'Submitting...' : 'Update'}
            </Button>
          </div>
        </form>
      </Form>
    </main>
  );
}
