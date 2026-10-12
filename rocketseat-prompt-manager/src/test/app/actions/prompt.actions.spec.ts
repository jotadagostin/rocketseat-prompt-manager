import {
  createPromptAction,
  deletePromptAction,
  searchPromptAction,
  updatePromptAction,
} from '@/app/actions/prompt.actions';

jest.mock('@/lib/prisma', () => ({ prisma: {} }));

const mockedSearchExecute = jest.fn();
const mockedCreateExecute = jest.fn();
const mockedUpdateExecute = jest.fn();
const mockedDeleteExecute = jest.fn();

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

jest.mock('@/core/aplication/prompts/update-prompt.use-case', () => ({
  UpdatePromptUseCase: jest.fn().mockImplementation(() => ({
    execute: mockedUpdateExecute,
  })),
}));
jest.mock('@/core/aplication/prompts/delete-prompt.use-case', () => ({
  DeletePromptUseCase: jest.fn().mockImplementation(() => ({
    execute: mockedDeleteExecute,
  })),
}));

describe('Server Actions: Prompts', () => {
  beforeEach(() => {
    mockedSearchExecute.mockReset();
    mockedCreateExecute.mockReset();
    mockedUpdateExecute.mockReset();
    mockedDeleteExecute.mockReset();
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
      expect(result?.message).toBe('Prompt created successfully.');
    });

    it('deve retornar erro de validação quando os campos forem vazios', async () => {
      const data = {
        title: '',
        content: '',
      };

      const result = await createPromptAction(data);

      expect(result?.success).toBe(false);
      expect(result?.message).toBe('Failed to create prompt.');
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
      expect(result?.message).toBe('A prompt with this title already exists.');
    });

    it('Deve retornar error generico quando a criacao falhar', async () => {
      mockedCreateExecute.mockRejectedValue(new Error('UNKNOWN'));
      const data = {
        title: 'Title',
        content: 'Content',
      };

      const result = await createPromptAction(data);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to create prompt.');
    });
  });

  describe('updatePromptAction', () => {
    it('Deve atualizar um prompt existente com sucesso', async () => {
      mockedUpdateExecute.mockResolvedValue({});
      const promptId = '1';
      const data = {
        id: promptId,
        title: 'New Title',
        content: 'New Content',
      };

      const result = await updatePromptAction(data);
      expect(result).toMatchObject({
        success: true,
        message: 'Prompt updated with success',
      });
    });

    it('Deve retornar erro de validacao quando os campos faltarem', async () => {
      const data = {
        id: '1',
        title: '',
        content: '',
      };
      const result = await updatePromptAction(data);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to update prompt.');
      expect(result.errors).toBeDefined();
    });

    it('Deve retornar erro quando o prompt nao existir', async () => {
      mockedUpdateExecute.mockRejectedValue(new Error('PROMPT_NOT_FOUND'));
      const promptId = '1';
      const data = {
        id: promptId,
        title: 'New',
        content: 'Content',
      };

      const result = await updatePromptAction(data);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Prompt not found.');
    });

    it('Deve retornar erro generico quando a atualizacao falhar', async () => {
      mockedUpdateExecute.mockRejectedValue(new Error('UNKNOWN'));
      const promptId = '1';
      const data = {
        id: promptId,
        title: 'New',
        content: 'Content',
      };

      const result = await updatePromptAction(data);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to update prompt.');
    });
  });

  describe.only('deletePromptAction', () => {
    it('Deve remover com sucesso', async () => {
      mockedDeleteExecute.mockResolvedValue(undefined);
      const promptId = '1';
      const result = await deletePromptAction(promptId);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Prompt deleted successfully.');
    });
    it('Deve retornar erro quando o id for vazio', async () => {
      const promptId = '';
      const result = await deletePromptAction(promptId);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Prompt ID is required.');
    });

    it('Deve retornar erro quando o prompt nao existir', async () => {
      mockedDeleteExecute.mockRejectedValue(new Error('PROMPT_NOT_FOUND'));

      const promptId = '1';

      const result = await deletePromptAction(promptId);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Prompt not found.');
    });

    it('Deve retornar um erro generico quando a action falhar', async () => {
      mockedDeleteExecute.mockRejectedValue(new Error('UNKNOWN'));
      const promptId = '1';

      const result = await deletePromptAction(promptId);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to delete prompt.');
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
      const error = new Error('Failed to search prompts.');
      mockedSearchExecute.mockRejectedValueOnce(error);

      const formData = new FormData();
      formData.append('q', 'AI');

      const result = await searchPromptAction({ success: true }, formData);

      expect(result.success).toBe(false);
      expect(result.prompts).toBeUndefined();
      expect(result.message).toBe('Failed to search prompts.');
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
