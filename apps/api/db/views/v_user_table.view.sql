-- Gastos view: v_user_table
-- Applied by db/migrate.ts after db/schema.sql.

CREATE OR REPLACE VIEW `v_user_table` AS
/* Select Query */
SELECT
  id,
  name,
  email,
  emailVerified,
  image
FROM
	user;
/* END Select Query */
