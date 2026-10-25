-- Gastos view: v_transactions_table
-- Applied by db/migrate.ts after db/schema.sql.

CREATE OR REPLACE VIEW `v_transactions_table` AS
/* Select Query */
SELECT
  id,
  note,
  amount,
  transfer_fee,
  type,
  time,
  date,
  ref_accounts_id,
  ref_categories_id,
  ref_user_id
FROM
	transactions;
/* END Select Query */
