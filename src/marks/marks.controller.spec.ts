import { Test, TestingModule } from '@nestjs/testing';
import { MarksController } from '../marks/marks.controller';
import { MarksService } from '../marks/marks.service';
import { CoordsDto } from '../marks/dto/coords.dto';
import { VerifyMarkDto } from './dto/verify-mark.dto';
import { CreateMarkDto } from './dto/create-mark.dto';
import { MarkDto } from '../marks/dto/mark.dto';

describe('MarksController', () => {
  let marksController: MarksController;
  let marksService: MarksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarksController],
      providers: [
        {
          provide: MarksService,
          useValue: {
            getMarks: jest.fn(),
            getMark: jest.fn(),
            verifyTrue: jest.fn(),
            verifyFalse: jest.fn(),
            getCategories: jest.fn(),
            createMark: jest.fn(),
          },
        },
      ],
    }).compile();

    marksController = module.get<MarksController>(MarksController);
    marksService = module.get<MarksService>(MarksService);
  });

  describe('getMarks', () => {
    it('should call marksService.getMarks with CoordsDto', async () => {
      const coordsDto: CoordsDto = { lat: 50, lng: 30 };
      await marksController.getMarks(coordsDto);
      expect(marksService.getMarks).toHaveBeenCalledWith(coordsDto);
    });
  });

  describe('getMark', () => {
    it('should call marksService.getMark with MarkDto', async () => {
      const markDto: MarkDto = { userId: '1', markId: '2', lat: 50, lng: 30 };
      await marksController.getMark(markDto);
      expect(marksService.getMark).toHaveBeenCalledWith(markDto);
    });
  });

  describe('verifyTrue', () => {
    it('should call marksService.verifyTrue with VerifyMarkDto', async () => {
      const verifyMarkDto: VerifyMarkDto = {
        userId: '1',
        markId: 2,
        csrf_token: 'test',
      };
      await marksController.verifyTrue(verifyMarkDto);
      expect(marksService.verifyTrue).toHaveBeenCalledWith(verifyMarkDto);
    });
  });

  describe('verifyFalse', () => {
    it('should call marksService.verifyFalse with VerifyMarkDto', async () => {
      const verifyMarkDto: VerifyMarkDto = {
        userId: '1',
        markId: 2,
        csrf_token: 'test',
      };
      await marksController.verifyFalse(verifyMarkDto);
      expect(marksService.verifyFalse).toHaveBeenCalledWith(verifyMarkDto);
    });
  });

  describe('getCategories', () => {
    it('should call marksService.getCategories', async () => {
      await marksController.getCategories();
      expect(marksService.getCategories).toHaveBeenCalled();
    });
  });

  describe('createMark', () => {
    it('should call marksService.createMark with CreateMarkDto', async () => {
      const createMarkDto: CreateMarkDto = {
        lat: 50,
        lng: 30,
        categoryId: 1,
        userId: 'test',
        title: 'test',
        description: 'test',
        csrf_token: 'test',
      };
      await marksController.createMark(createMarkDto);
      expect(marksService.createMark).toHaveBeenCalledWith(createMarkDto);
    });
  });
});
