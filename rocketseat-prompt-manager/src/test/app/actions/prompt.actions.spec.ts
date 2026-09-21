import {
  createPromptAction,
  searchPromptAction,
} from '@/app/actions/prompt.actions';
import { title } from 'process';

jest.mock('@/lib/prisma', () => ({ prisma: {} }));

const mockedSearchExecute = jest.fn();
const mockedCreateExecute = jest.fn();

jest.mock('@/core/aplication/prompts/search-prompts.use-case', () => ({
  SearchPromptsUseCase: jest.fn().mockImplementation(() => ({
    execute: mockedSearchExecute,
  })),
}));

jest.mock('@/core/aplication/prompts/create-prompt.use-case', () => ({
  CreatePromptUseCase: jest.fn().mockImplementation(() => ({
    execute: mockedCreateExecute,
  })),
}));

describe('Server Actions: Prompts', () => {
  beforeEach(() => {
    mockedSearchExecute.mockReset();
  });

  describe('createPromptAction', () => {
    it('deve criar um prompt com sucesso', async () => {
      mockedCreateExecute.mockResolvedValue(undefined);
      const data = {
        title: 'Title',
        content: 'Content',
      };

      const result = await createPromptAction(data);

      expect(result?.success).toBe(true);
      expect(result?.message).toBe('Prompt criado com sucesso');
    });

    it('deve retornar erro de validação quando os campos forem vazios', async () => {
      const data = {
        title: '',
        content: '',
      };

      const result = await createPromptAction(data);

      expect(result?.success).toBe(false);
      expect(result?.message).toBe('Falha ao criar prompt.');
      expect(result?.errors).toBeDefined();
    });

    it('deve retornar erro quando o prompt já existir', async () => {
      mockedCreateExecute.mockRejectedValue(new Error('PROMPT_ALREADY_EXISTS'));
      const data = {
        title: 'duplicado',
        content: 'duplicado',
      };

      const result = await createPromptAction(data);

      expect(result?.success).toBe(false);
      expect(result?.message).toBe('Prompt com esse título já existe.');
    });
  });

  describe('searchPromptAction', () => {
    it('deve retornar sucesso com o termo de busca nao vazio', async () => {
      const input = [{ id: '1', title: 'AI Title', content: 'Content 01' }];
      mockedSearchExecute.mockResolvedValueOnce(input);

      const formData = new FormData();
      formData.append('q', 'AI');

      const result = await searchPromptAction({ success: true }, formData);

      expect(result.success).toBe(true);
      expect(result.prompts).toEqual(input);
    });

    it('deve retornar sucesso e listar todos os prompts quando o termo de busca estiver vazio', async () => {
      const input = [
        { id: '1', title: 'AI Title 1', content: 'Content 01' },
        { id: '2', title: 'AI Title 2', content: 'Content 02' },
      ];
      mockedSearchExecute.mockResolvedValueOnce(input);

      const formData = new FormData();
      formData.append('q', '');

      const result = await searchPromptAction({ success: true }, formData);

      expect(result.success).toBeDefined();
      expect(result.prompts).toEqual(input);
    });

    it('Deve retornar um erro generico quando falhar a busca', async () => {
      const error = new Error('Falha ao buscar prompts.');
      mockedSearchExecute.mockRejectedValueOnce(error);

      const formData = new FormData();
      formData.append('q', 'AI');

      const result = await searchPromptAction({ success: true }, formData);

      expect(result.success).toBe(false);
      expect(result.prompts).toBeUndefined();
      expect(result.message).toBe('Falha ao buscar prompts.');
    });

    it('Deve aparar espacos do termo antes de executar', async () => {
      const input = [{ id: '1', title: 'AI Title', content: 'Content 01' }];
      mockedSearchExecute.mockResolvedValueOnce(input);

      const formData = new FormData();
      formData.append('q', ' Title 01 ');

      const result = await searchPromptAction({ success: true }, formData);

      expect(mockedSearchExecute).toHaveBeenCalledWith('Title 01');
      expect(result.success).toBe(true);
      expect(result.prompts).toEqual(input);
    });

    it('Deve tratar ausencia da query como termo vazio', async () => {
      const input = [
        { id: '1', title: 'AI Title 1', content: 'Content 01' },
        { id: '2', title: 'AI Title 2', content: 'Content 02' },
      ];
      mockedSearchExecute.mockResolvedValueOnce(input);

      const formData = new FormData();

      const result = await searchPromptAction({ success: true }, formData);

      expect(mockedSearchExecute).toHaveBeenCalledWith('');
      expect(result.success).toBe(true);
      expect(result.prompts).toEqual(input);
    });
  });
});
