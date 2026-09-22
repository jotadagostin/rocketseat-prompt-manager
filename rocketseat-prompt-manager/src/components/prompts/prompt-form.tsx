'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useForm } from 'react-hook-form';
import {
  CreatePromptDTO,
  createPromptSchema,
} from '@/core/aplication/prompts/create-prompt.dto';
import { Form, FormControl, FormField, FormItem } from '../ui/form';
import { createPromptAction } from '@/app/actions/prompt.actions';
import { useRouter } from 'next/navigation';

export const PromptForm = () => {
  const router = useRouter();

  const form = useForm<CreatePromptDTO>({
    resolver: zodResolver(createPromptSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  const submit = async (data: CreatePromptDTO) => {
    const result = await createPromptAction(data);
    console.log('submit', result);

    if (!result.success) {
      return;
    }

    router.refresh();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} className="space-y-6">
        <header className="flex flex-wrap gap-2 items-center mb-6 justify-end">
          <Button type="submit" size="sm">
            Save
          </Button>
        </header>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...form.register('title')}
                  placeholder="Title of the prompt"
                  variant="transparent"
                  size="lg"
                  autoFocus
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Digite o conteúdo do prompt..."
                  variant="transparent"
                  size="lg"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
