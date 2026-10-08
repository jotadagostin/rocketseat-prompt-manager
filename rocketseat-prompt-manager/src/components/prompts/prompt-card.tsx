'use client';
import { PromptSummary } from '@/core/domain/prompts/prompt.entity';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Trash as DeleteIcon, Loader2 as LoadingIcon } from 'lucide-react';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';

export type PromptCardProps = {
  prompt: PromptSummary;
};

export const PromptCard = ({ prompt }: PromptCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
  };

  return (
    <li className="p-3 rounded-lg transition-all duration-200 group relative hover:bg-gray-700">
      <header className="flex items-start justify-between">
        <Link href={`/${prompt.id}`} prefetch className="flex-1 min-w-0">
          <h3 className="font-medium text-sm text-white group-hover:text-accent-300 transition-colors">
            {prompt.title}
          </h3>

          <p className="text-xs text-gray-400 mt-1 line-clamp-2">
            {prompt.content}
          </p>
        </Link>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="icon"
              size="icon"
              title="Remove Prompt"
              aria-label="Remove Prompt"
              onClick={() => setIsDeleting(true)}
            >
              <DeleteIcon className="w-3 h-3" />
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Prompt</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove this prompt? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                {isDeleting && (
                  <LoadingIcon className="mr-2 h-4 w-4 animate-spin" />
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </header>
    </li>
  );
};
