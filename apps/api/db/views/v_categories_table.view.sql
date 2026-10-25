-- Gastos view: v_categories_table
-- Applied by db/migrate.ts after db/schema.sql.

CREATE OR REPLACE VIEW `v_categories_table` AS
/* Select Query */
SELECT
  id,
  name,
  type,
  icon,
  description,
  ref_accounts_id,
  ref_user_id
FROM
  categories;
/* END Select Query */
