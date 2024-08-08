export const getNearestPoints = `
  SELECT sorted_marks.lng, sorted_marks.lat, sorted_marks.mark_id AS "id", sorted_marks."categoryId", category.color
  FROM (
    SELECT lng, lat, mark_id, "categoryId",
      ST_Distance(
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
      ) AS distance
    FROM ${process.env.DB_SCHEMA}.mark
  ) AS sorted_marks
  JOIN ${process.env.DB_SCHEMA}.category ON sorted_marks."categoryId" = category.category_id
  ORDER BY sorted_marks.distance
  LIMIT 50;
`;

export const getNearestPointsWithDistance = `
      SELECT lng, lat, mark_id AS "id", "categoryId",
        ST_Distance(
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
        ) AS distance
      FROM ${process.env.DB_SCHEMA}.mark
      ORDER BY distance
      LIMIT 50;
`;

export const checkApproximateDistance = `
        SELECT *
        FROM ${process.env.DB_SCHEMA}.mark
        WHERE ST_DWithin(
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
          $3
        )
        LIMIT 1
      `;

export const getDistance = `
      SELECT 
        ST_Distance(
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
        ) AS distance
      FROM ${process.env.DB_SCHEMA}.mark
      WHERE mark_id = $3
`;
