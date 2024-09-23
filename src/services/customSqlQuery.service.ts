import { Injectable } from '@nestjs/common';

@Injectable()
export class CustomSqlQueryService {
  getNearestPoints(schema: string) {
    return `
        SELECT sorted_marks.lng, sorted_marks.lat, sorted_marks.mark_id AS "id", sorted_marks."categoryId", category.color
        FROM (
            SELECT lng, lat, mark_id, "categoryId",
            ST_Distance(
                ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
                ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
            ) AS distance
            FROM ${schema}.mark
        ) AS sorted_marks
        JOIN ${schema}.category ON sorted_marks."categoryId" = category.category_id
        ORDER BY sorted_marks.distance
        LIMIT 50;
        `;
  }

  getNearestPointsWithDistance(schema: string) {
    return `
        SELECT lng, lat, mark_id AS "id", "categoryId",
            ST_Distance(
            ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
            ) AS distance
        FROM ${schema}.mark
        ORDER BY distance
        LIMIT 50;
            `;
  }

  checkApproximateDistance(schema: string) {
    return `
            SELECT *
            FROM ${schema}.mark
            WHERE ST_DWithin(
            ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
            $3
            )
            LIMIT 1
        `;
  }

  getDistance(schema: string) {
    return `
        SELECT 
            ST_Distance(
            ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
            ) AS distance
        FROM ${schema}.mark
        WHERE mark_id = $3
        `;
  }
}
