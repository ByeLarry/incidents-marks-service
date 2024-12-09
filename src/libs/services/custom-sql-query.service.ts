import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CustomSqlQueryService {
  private readonly schema: string;

  constructor(private readonly configService: ConfigService) {
    this.schema = this.configService.get<string>('DB_SCHEMA', 'public');
  }

  getNearestPoints() {
    return `
        SELECT sorted_marks.lng, sorted_marks.lat, sorted_marks.mark_id AS "id", sorted_marks."categoryId", category.color
        FROM (
            SELECT lng, lat, mark_id, "categoryId",
            ST_Distance(
                ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
                ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
            ) AS distance
            FROM ${this.schema}.mark
        ) AS sorted_marks
        JOIN ${this.schema}.category ON sorted_marks."categoryId" = category.category_id
        ORDER BY sorted_marks.distance
        LIMIT 50;
        `;
  }

  getNearestPointsWithDistance() {
    return `
        SELECT lng, lat, mark_id AS "id", "categoryId",
            ST_Distance(
            ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
            ) AS distance
        FROM ${this.schema}.mark
        ORDER BY distance
        LIMIT 50;
            `;
  }

  checkApproximateDistance() {
    return `
            SELECT *
            FROM ${this.schema}.mark
            WHERE ST_DWithin(
            ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
            $3
            )
            LIMIT 1
        `;
  }

  getDistance() {
    return `
        SELECT 
            ST_Distance(
            ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
            ) AS distance
        FROM ${this.schema}.mark
        WHERE mark_id = $3
        `;
  }
}
