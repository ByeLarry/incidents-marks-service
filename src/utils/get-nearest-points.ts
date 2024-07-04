export const getNearestPoints = `
      SELECT *,
        ST_Distance(
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
        ) AS distance
      FROM marks.mark
      ORDER BY distance
      LIMIT 50;
    `;
