import { render, screen, waitFor } from '@/lib/test-utils';
import userEvent from '@testing-library/user-event';
import { PromptForm } from '@/components/prompts/prompt-form';
import { createPromptAction } from '@/app/actions/prompt.actions';
import { toast } from 'sonner';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));

jest.mock('@/app/actions/prompt.actions', () => ({
  createPromptAction: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('PromptForm', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve exibir a mensagem correta ao criar um prompt com sucesso', async () => {
    (createPromptAction as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Prompt criado com sucesso',
    });

    render(<PromptForm />);

    await user.type(
      screen.getByPlaceholderText('Title of the prompt'),
      'Nova ideia'
    );
    await user.type(
      screen.getByPlaceholderText('Digite o conteúdo do prompt...'),
      'Conteúdo do prompt'
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Prompt criado com sucesso');
    });
  });
});
