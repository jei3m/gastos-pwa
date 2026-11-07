-- Gastos view: v_account_members_table
-- Applied by db/migrate.ts after db/schema.sql.

CREATE OR REPLACE VIEW `v_account_members_table` AS
/* Select Query */
SELECT
	ref_accounts_id,
	ref_user_id,
	role,
	joined_at
FROM
    account_members;
/* END Select Query */
