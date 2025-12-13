CREATE OR REPLACE VIEW `v_categories_table` AS

/* Select Query */
SELECT 
  id,
  name,
  type,
  icon,
  ref_accounts_id,
  ref_user_id
FROM
  categories
/* END Select Query */