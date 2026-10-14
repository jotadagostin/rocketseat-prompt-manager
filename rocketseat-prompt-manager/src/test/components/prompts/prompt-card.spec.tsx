import {
  PromptCard,
  type PromptCardProps,
} from '@/components/prompts/prompt-card';
import { render, screen } from '@/lib/test-utils';
import { userEvent } from '@testing-library/user-event/dist/cjs/setup/index.js';
import { toast } from 'sonner';

const refreshMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

const deleteMOck = jest.fn();
jest.mock('@/app/actions/prompt.actions', () => ({
  deletePromptAction: (id: string) => deleteMOck(id),
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const makeSut = ({ prompt }: PromptCardProps) => {
  return render(<PromptCard prompt={prompt} />);
};

describe('PromptCard', () => {
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
    deleteMOck.mockResolvedValue({
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
  });

  it('Deveria exibir o erro quando a action falhar', async () => {
    const errorMessage = 'Failed to remove prompt';
    deleteMOck.mockResolvedValue({
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
});
