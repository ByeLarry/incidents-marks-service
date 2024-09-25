import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarkCleanupService } from '.';
import { Mark } from '../../marks/entities';

describe('MarkCleanupService', () => {
  let service: MarkCleanupService;
  let markRepository: Repository<Mark>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarkCleanupService,
        {
          provide: getRepositoryToken(Mark),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<MarkCleanupService>(MarkCleanupService);
    markRepository = module.get<Repository<Mark>>(getRepositoryToken(Mark));
  });

  describe('cleanupOldMarks', () => {
    it('should delete marks older than 12 hours', async () => {
      const deleteSpy = jest
        .spyOn(markRepository, 'delete')
        .mockResolvedValueOnce(null);

      await service.cleanupOldMarks();

      expect(deleteSpy).toHaveBeenCalledWith({
        createdAt: expect.objectContaining({
          _type: 'lessThan',
          _value: expect.any(Date),
        }),
      });
    });

    it('should log an error if delete fails', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const deleteSpy = jest
        .spyOn(markRepository, 'delete')
        .mockRejectedValueOnce(new Error('Delete error'));

      await service.cleanupOldMarks();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.any(Number),
        ' Error deleting old marks:',
        expect.any(Error),
      );

      deleteSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });
});
