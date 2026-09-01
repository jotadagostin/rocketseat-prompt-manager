import { SearchPromptsUseCase } from '@/core/aplication/prompts/search-prompts.use-case';
import { Prompt } from '@/core/domain/prompts/prompt.entity';
import { PromptRepository } from '@/core/domain/prompts/prompt.respository';

describe('SearchPromptsUseCase', () => {
  const input: Prompt[] = [
    {
      id: '1',
      title: 'AI Title 1',
      content: 'Content 01',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      title: 'AI Title 2',
      content: 'Content 02',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  const repository: PromptRepository = {
    findMany: async () => input,
    searchMany: async (term: string) =>
      input.filter(
        (prompt) =>
          prompt.title.toLowerCase().includes(term.toLowerCase()) ||
          prompt.content.toLowerCase().includes(term.toLowerCase())
      ),
  };

  it('deve retornar sucesso com o termo de busca for vazio', async () => {
    const useCase = new SearchPromptsUseCase(repository);

    const results = await useCase.execute('');
    expect(results).toHaveLength(2);
  });

  it('Deve filtrar a lista de prompts pelo termo pesquisado', async () => {
    const useCase = new SearchPromptsUseCase(repository);
    const query = 'Title 1';
    const results = await useCase.execute(query);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('1');
  });

  it('Deve aplicar trim em busca com termo com espacos em branco e retornar todaa a lista de prompts', async () => {
    const findMany = jest.fn().mockResolvedValue(input);
    const searchMany = jest.fn().mockResolvedValue([]);
    const repositoryWithSpies: PromptRepository = {
      ...repository,
      findMany,
      searchMany,
    };
    const useCase = new SearchPromptsUseCase(repositoryWithSpies);
    const query = '   ';
    const results = await useCase.execute(query);
    expect(results).toHaveLength(2);
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(searchMany).not.toHaveBeenCalled();
  });

  it('Deve buscar termo com espacos em branco tratando com o trim', async () => {
    const firstElement = input.slice(0, 1);
    const findMany = jest.fn().mockResolvedValue(input);
    const searchMany = jest.fn().mockResolvedValue(firstElement);
    const repositoryWithSpies: PromptRepository = {
      ...repository,
      findMany,
      searchMany,
    };
    const useCase = new SearchPromptsUseCase(repositoryWithSpies);
    const query = '  title 2 ';
    const results = await useCase.execute(query);
    expect(results).toMatchObject(firstElement);
    expect(findMany).not.toHaveBeenCalled();
    expect(searchMany).toHaveBeenCalledWith(query.trim());
  });

  it('Deve lidar com termo undefined ou null', async () => {
    const findMany = jest.fn().mockResolvedValue(input);
    const searchMany = jest.fn().mockResolvedValue([]);
    const repositoryWithSpies: PromptRepository = {
      ...repository,
      findMany,
      searchMany,
    };
    const useCase = new SearchPromptsUseCase(repositoryWithSpies);
    const query = undefined as unknown as string;

    const results = await useCase.execute(query);

    expect(results).toMatchObject(input);
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(searchMany).not.toHaveBeenCalled();
  });
});
