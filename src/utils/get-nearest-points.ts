export const getNearestPoints = `
  SELECT lng, lat, mark_id AS "id", "categoryId"
  FROM (
    SELECT lng, lat, mark_id, "categoryId",
      ST_Distance(
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
      ) AS distance
    FROM marks.mark
  ) AS sorted_marks
  ORDER BY distance
  LIMIT 50;
`;

export const getNearestPointsWithDistance = `
      SELECT lng, lat, mark_id AS "id", "categoryId",
        ST_Distance(
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
        ) AS distance
      FROM marks.mark
      ORDER BY distance
      LIMIT 50;
`;

export const checkApproximateDistance = `
        SELECT *
        FROM marks.mark
        WHERE ST_DWithin(
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
          $3
        )
        LIMIT 1
      `;
