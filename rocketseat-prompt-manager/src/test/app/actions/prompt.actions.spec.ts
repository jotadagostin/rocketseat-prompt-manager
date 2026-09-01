import { searchPromptAction } from '@/app/actions/prompt.actions';

jest.mock('@/lib/prisma', () => ({ prisma: {} }));
const mockedSearchExecute = jest.fn();

jest.mock('@/core/aplication/prompts/search-prompts.use-case', () => ({
  SearchPromptsUseCase: jest.fn().mockImplementation(() => ({
    execute: mockedSearchExecute,
  })),
}));

describe('Server Actions: Prompts', () => {
  beforeEach(() => {
    mockedSearchExecute.mockReset();
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
      formData.append('q', ' Title 01 '); // Termo com espaços em branco

      const result = await searchPromptAction({ success: true }, formData);

      expect(mockedSearchExecute).toHaveBeenCalledWith('Title 01'); // Verifica se o termo foi aparado
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

      expect(mockedSearchExecute).toHaveBeenCalledWith(''); // Verifica se o termo foi tratado como vazio
      expect(result.success).toBe(true);
      expect(result.prompts).toEqual(input);
    });
  });
});
