import { CreatePromptDTO } from '@/core/aplication/prompts/create-prompt.dto';
import { Prompt } from './prompt.entity';

export interface PromptRepository {
  create(data: CreatePromptDTO): Promise<void>;
  findMany(): Promise<Prompt[]>;
  findById(id: string): Promise<Prompt | null>;
  findByTitle(title: string): Promise<Prompt | null>;
  searchMany(term: string): Promise<Prompt[]>;
}
