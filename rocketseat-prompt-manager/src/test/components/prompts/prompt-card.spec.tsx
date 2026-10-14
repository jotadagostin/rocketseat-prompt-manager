import {
  PromptCard,
  type PromptCardProps,
} from '@/components/prompts/prompt-card';
import { render, screen } from '@/lib/test-utils';
import { userEvent } from '@testing-library/user-event/dist/cjs/setup/index.js';
import { toast } from 'sonner';

const deleteMock = jest.fn();
jest.mock('@/app/actions/prompt.actions', () => ({
  deletePromptAction: (id: string) => deleteMock(id),
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const refreshMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

const makeSut = ({ prompt }: PromptCardProps) => {
  return render(<PromptCard prompt={prompt} />);
};

describe('PromptCard', () => {
  beforeEach(() => {
    deleteMock.mockReset();
    refreshMock.mockReset();
    (toast.success as jest.Mock).mockReset();
    (toast.error as jest.Mock).mockReset();
  });
  const user = userEvent.setup();
  const prompt = { id: '1', title: 'title 01', content: 'content 01' };

  it('deveria renderizar o link com href corretamente', () => {
    makeSut({ prompt });
    const link = screen.getByRole('link');

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', `/${prompt.id}`);
  });

  it('Deveria abrir o dialog de remocao do prompt', async () => {
    makeSut({ prompt });

    const deleteButton = screen.getByRole('button', {
      name: 'Remove Prompt',
    });
    await user.click(deleteButton);

    expect(screen.getByText('Remove Prompt')).toBeInTheDocument();
  });

  it('Deveria remover com sucesso e exibir o toast', async () => {
    deleteMock.mockResolvedValue({
      success: true,
      message: 'Prompt removed successfully',
    });
    makeSut({ prompt });

    const deleteButton = screen.getByRole('button', {
      name: 'Remove Prompt',
    });
    await user.click(deleteButton);
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(toast.success).toHaveBeenCalledWith('Prompt removed successfully');
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });

  it('Deveria exibir o erro quando a action falhar', async () => {
    const errorMessage = 'Failed to remove prompt';
    deleteMock.mockResolvedValue({
      success: false,
      message: errorMessage,
    });
    makeSut({ prompt });

    const deleteButton = screen.getByRole('button', {
      name: 'Remove Prompt',
    });
    await user.click(deleteButton);
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(toast.error).toHaveBeenCalledWith(errorMessage);
  });

  it('deve exibir erro quando a action lançar uma exceção', async () => {
    const errorMessage = 'Erro';
    deleteMock.mockRejectedValueOnce(new Error(errorMessage));
    makeSut({ prompt });

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(toast.error).toHaveBeenCalledWith(errorMessage);
    expect(refreshMock).not.toHaveBeenCalled();
  });
});
