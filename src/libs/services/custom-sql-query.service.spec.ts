import { Test, TestingModule } from '@nestjs/testing';
import { CustomSqlQueryService } from '.';

describe('CustomSqlQueryService', () => {
  let service: CustomSqlQueryService;
  const schema = 'public';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomSqlQueryService],
    }).compile();

    service = module.get<CustomSqlQueryService>(CustomSqlQueryService);
  });

  describe('getNearestPoints', () => {
    it('should generate correct SQL query', () => {
      const expectedQuery = `
        SELECT sorted_marks.lng, sorted_marks.lat, sorted_marks.mark_id AS "id", sorted_marks."categoryId", category.color
        FROM (
            SELECT lng, lat, mark_id, "categoryId",
            ST_Distance(
                ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
                ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
            ) AS distance
            FROM public.mark
        ) AS sorted_marks
        JOIN public.category ON sorted_marks."categoryId" = category.category_id
        ORDER BY sorted_marks.distance
        LIMIT 50;
        `;
      expect(service.getNearestPoints(schema)).toBe(expectedQuery);
    });
  });

  describe('getNearestPointsWithDistance', () => {
    it('should generate correct SQL query', () => {
      const expectedQuery = `
        SELECT lng, lat, mark_id AS "id", "categoryId",
            ST_Distance(
            ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
            ) AS distance
        FROM public.mark
        ORDER BY distance
        LIMIT 50;
            `;
      expect(service.getNearestPointsWithDistance(schema)).toBe(expectedQuery);
    });
  });

  describe('checkApproximateDistance', () => {
    it('should generate correct SQL query', () => {
      const expectedQuery = `
            SELECT *
            FROM public.mark
            WHERE ST_DWithin(
            ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
            $3
            )
            LIMIT 1
        `;
      expect(service.checkApproximateDistance(schema)).toBe(expectedQuery);
    });
  });

  describe('getDistance', () => {
    it('should generate correct SQL query', () => {
      const expectedQuery = `
        SELECT 
            ST_Distance(
            ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
            ) AS distance
        FROM public.mark
        WHERE mark_id = $3
        `;
      expect(service.getDistance(schema)).toBe(expectedQuery);
    });
  });
});
