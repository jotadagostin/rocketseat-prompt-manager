import { PrismaPromptRepository } from '@/app/infra/repository/prisma-prompt.repository';
import { CreatePromptDTO } from '@/core/aplication/prompts/create-prompt.dto';
import { Prompt } from '@/core/domain/prompts/prompt.entity';
import { PrismaClient } from '@/generated/prisma/client';

type PromptDelegateMock = {
  create: jest.MockedFunction<
    (args: { data: CreatePromptDTO }) => Promise<void>
  >;
  findFirst: jest.MockedFunction<
    (args: {
      where: { title: string };
    }) => Promise<Pick<Prompt, 'id' | 'title' | 'content'> | null>
  >;
  findMany: jest.MockedFunction<
    (args: {
      orderBy?: { createdAt: 'asc' | 'desc' };
      where?: {
        OR: Array<{
          title?: { contains: string; mode: 'insensitive' };
          content?: { contains: string; mode: 'insensitive' };
        }>;
      };
    }) => Promise<Prompt[]>
  >;
};

type PrismaMock = {
  prompt: PromptDelegateMock;
};

function createMockPrisma() {
  const mock = {
    prompt: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  return mock as unknown as PrismaClient & PrismaMock;
}

describe('PrismaPromptRepository', () => {
  let prisma: ReturnType<typeof createMockPrisma>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let repository: PrismaPromptRepository;

  beforeEach(() => {
    prisma = createMockPrisma();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    repository = new PrismaPromptRepository(prisma as any);
  });

  describe('create', () => {
    it('deve chamar o metodo create com os dados corretos', async () => {
      const input = {
        title: 'title',
        content: 'content',
      };

      await repository.create(input);

      expect(prisma.prompt.create).toHaveBeenCalledWith({
        data: input,
      });
    });
  });

  describe('findByTitle', () => {
    it('deve chamar o findFirst com o title corretamente', async () => {
      const title = 'title 01';
      const input = {
        id: 'p1',
        title: 'title 01',
        content: 'content 01',
      };

      prisma.prompt.findFirst.mockResolvedValue(input);

      const result = await repository.findByTitle('title 01');

      expect(prisma.prompt.findFirst).toHaveBeenCalledWith({
        where: {
          title,
        },
      });
      expect(result).toEqual(input);
    });
  });

  describe('findMany', () => {
    it('deve ordernar por createdAt desc e mapear os resultados', async () => {
      const now = new Date();
      const input = [
        {
          id: '1',
          title: 'Title 1',
          content: 'Content 1',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: '2',
          title: 'Title 2',
          content: 'Content 2',
          createdAt: now,
          updatedAt: now,
        },
      ];
      prisma.prompt.findMany.mockResolvedValue(input);

      const results = await repository.findMany();

      expect(results).toMatchObject(input);
      expect(prisma.prompt.findMany).toHaveBeenCalledWith({
        orderBy: {
          createdAt: 'desc',
        },
      });
    });
  });

  describe('searchMany', () => {
    it('deve buscar por termo vazio e nao enviar o where', async () => {
      const now = new Date();
      const input = [
        {
          id: '1',
          title: 'Title 1',
          content: 'Content 1',
          createdAt: now,
          updatedAt: now,
        },
      ];
      prisma.prompt.findMany.mockResolvedValue(input);
      const results = await repository.searchMany('   ');

      expect(prisma.prompt.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: { createdAt: 'desc' },
      });
      expect(results).toMatchObject(input);
    });
    it('deve buscar por termo e popular OR no where', async () => {
      const now = new Date();
      const input = [
        {
          id: '1',
          title: 'Title 1',
          content: 'Content 1',
          createdAt: now,
          updatedAt: now,
        },
      ];
      prisma.prompt.findMany.mockResolvedValue(input);
      const results = await repository.searchMany('title 1');

      expect(prisma.prompt.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: 'title 1', mode: 'insensitive' } },
            { content: { contains: 'title 1', mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(results).toMatchObject(input);
    });
  });
});
