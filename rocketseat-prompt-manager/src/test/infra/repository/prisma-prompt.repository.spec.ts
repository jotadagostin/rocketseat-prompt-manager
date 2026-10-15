import { PrismaPromptRepository } from '@/app/infra/repository/prisma-prompt.repository';
import { CreatePromptDTO } from '@/core/aplication/prompts/create-prompt.dto';
import { UpdatePromptDTO } from '@/core/aplication/prompts/update-prompt.dto';
import { Prompt } from '@/core/domain/prompts/prompt.entity';
import { PrismaClient } from '@/generated/prisma/client';

type PromptDelegateMock = {
  create: jest.MockedFunction<
    (args: { data: CreatePromptDTO }) => Promise<void>
  >;
  update: jest.MockedFunction<
    (args: { where: { id: string }; data: UpdatePromptDTO }) => Promise<Prompt>
  >;
  delete: jest.MockedFunction<
    (args: { where: { id: string } }) => Promise<void>
  >;
  findByUnique: jest.MockedFunction<
    (args: { where: { id: string } }) => Promise<Prompt | null>
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
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  return mock as unknown as PrismaClient & PrismaMock;
}

describe('PrismaPromptRepository', () => {
  let prisma: ReturnType<typeof createMockPrisma>;
  let repository: PrismaPromptRepository;

  beforeEach(() => {
    prisma = createMockPrisma();
    repository = new PrismaPromptRepository(prisma);
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

  describe('update', () => {
    it('deve atualizar e retornar o prompt', async () => {
      const now = new Date();
      const input = {
        id: '1',
        title: 'new title',
        content: 'new content',
        createdAt: now,
        updatedAt: now,
      };
      prisma.prompt.update.mockResolvedValue(input);

      const result = await repository.update(input.id, {
        title: input.title,
        content: input.content,
      });

      expect(prisma.prompt.update).toHaveBeenCalledWith({
        where: { id: input.id },
        data: {
          title: input.title,
          content: input.content,
        },
      });
      expect(result).toEqual(input);
    });

    it('Deve enviar apenas campos presentes(somente title)', async () => {
      const now = new Date();
      const input = {
        id: '1',
        title: 'new title',
        content: '',
        createdAt: now,
        updatedAt: now,
      };
      prisma.prompt.update.mockResolvedValue(input);

      await repository.update(input.id, {
        title: input.title,
      });
      const call = prisma.prompt.update.mock.calls[0][0];

      expect(call.where).toEqual({ id: input.id });
      expect(call.data).toEqual({ title: input.title });
      expect('content' in call.data).toBe(false);
    });

    it('Deve enviar apenas campos presentes(somente content)', async () => {
      const now = new Date();
      const input = {
        id: '1',
        title: '',
        content: 'new content',
        createdAt: now,
        updatedAt: now,
      };
      prisma.prompt.update.mockResolvedValue(input);

      await repository.update(input.id, {
        content: input.content,
      });
      const call = prisma.prompt.update.mock.calls[0][0];

      expect(call.where).toEqual({ id: input.id });
      expect(call.data).toEqual({ content: input.content });
      expect('title' in call.data).toBe(false);
    });
  });

  describe('delete', () => {
    it('deve chamar prisma.prompt.delete com where id', async () => {
      const promptId = '1';
      await repository.delete(promptId);

      expect(prisma.prompt.delete).toHaveBeenLastCalledWith({
        where: {
          id: promptId,
        },
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

  describe('findById', () => {
    it('Deve retornar um prompt quando existir', async () => {
      const now = new Date();
      const input = {
        id: '1',
        title: 'title',
        content: 'content',
        createdAt: now,
        updatedAt: now,
      };
      jest.spyOn(prisma.prompt, 'findUnique').mockResolvedValue(input);

      const result = await repository.findById(input.id);
      expect(prisma.prompt.findUnique).toHaveBeenCalledWith({
        where: { id: input.id },
      });
      expect(result).toEqual(input);
    });

    it('Deve retornar null quando nao existir um prompt', async () => {
      jest.spyOn(prisma.prompt, 'findUnique').mockResolvedValue(null);

      const result = await repository.findById('1');

      expect(result).toBeNull();
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
