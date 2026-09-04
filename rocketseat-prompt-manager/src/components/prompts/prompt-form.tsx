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

export const PromptForm = () => {
  const form = useForm<CreatePromptDTO>({
    resolver: zodResolver(createPromptSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit((data) => console.log(data))}
      className="space-y-6"
    >
        <header className="flex flex-wrap gap-2 items-center mb-6 justify-end">
          <Button type="submit" size="sm">
            Save
          </Button>

          <Input
            {...form.register('title')}
            placeholder="Title of the prompt"
            variant="transparent"
            size="lg"
            autoFocus
          />

          <Textarea
            {...form.register('content')}
            placeholder="Enter the prompt content..."
            variant="transparent"
            size="lg"
          />
        </header>
    </form>
  );
};
