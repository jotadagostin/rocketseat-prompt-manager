import { PromptRepository } from '@/core/domain/prompts/prompt.respository';
import { CreatePromptDTO } from './create-prompt.dto';

export class CreatePromptUseCase {
  constructor(private PromptRepository: PromptRepository) {}

  async execute(data: CreatePromptDTO): Promise<void> {
    const promptExists = await this.PromptRepository.findByTitle(data.title);
    if (promptExists) {
      throw new Error('Prompt with this title already exists.');
    }

    await this.PromptRepository.create(data);
  }
}
