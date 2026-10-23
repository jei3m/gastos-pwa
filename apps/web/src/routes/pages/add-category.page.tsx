import { useEffect } from 'react';
import { useNavigate } from 'react-router';
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
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { createCategory } from '@/features/categories/categories.tq.functions';
import { createCategorySchema } from '@/lib/schema/categories.schema';
import { toast } from '@/lib/toast';
import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { categoryTypes } from '@/lib/data';
import { Textarea } from '@/components/ui/textarea';
import IconPicker from '@/components/custom/icon-picker';
import { Loader } from 'lucide-react';

export default function AddCategoryPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<
    z.infer<typeof createCategorySchema>
  >({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: '',
      type: 'expense',
      icon: '',
      description: '',
    },
  });

  const transactionType = useWatch({
    control: form.control,
    name: 'type',
  });

  const { mutate: createCategoryMutation, isPending } =
    useMutation({
      mutationFn: (
        values: z.infer<typeof createCategorySchema>
      ) => createCategory(values),
      onSuccess: (data) => {
        void queryClient.invalidateQueries({
          queryKey: ['categories'],
        });
        toast.success(
          (data as { responseMessage: string })
            .responseMessage
        );
        form.reset();
        void navigate('/settings');
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  async function onSubmit(
    values: z.infer<typeof createCategorySchema>
  ) {
    createCategoryMutation(values);
  }

  useEffect(() => {
    if (form?.formState?.errors?.type?.message) {
      toast.error(form?.formState?.errors?.type?.message);
      console.error(form?.formState?.errors?.type?.message);
    }
  }, [form?.formState?.errors?.type?.message]);

  return (
    <main className="flex flex-col space-y-4 p-3">
      <TypographyH3>Create New Category</TypographyH3>
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
                      {categoryTypes.map((type, index) => (
                        <TabsTrigger
                          value={type.toLowerCase()}
                          key={index}
                          className={`text-md
														${
                              field.value.toLowerCase() ===
                              'expense'
                                ? 'data-active:bg-red-400'
                                : 'data-active:bg-green-300'
                            }`}
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
                <FormLabel>Category Icon</FormLabel>
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
                <FormLabel>Category Name</FormLabel>
                <FormControl>
                  <Input
                    required
                    placeholder="Category Name..."
                    {...field}
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
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Description..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-row justify-between">
            <Button
              onClick={() => {
                form.reset();
                void navigate(-1);
              }}
              className="bg-red-500"
              disabled={isPending}
              type="button"
            >
              Cancel
            </Button>
            <Button
              className="space-x-2"
              type="submit"
              disabled={isPending}
            >
              {isPending && (
                <Loader className="animate-spin" />
              )}
              Submit
            </Button>
          </div>
        </form>
      </Form>
    </main>
  );
}
