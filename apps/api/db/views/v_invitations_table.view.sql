-- Gastos view: v_invitations_table
-- Applied by db/migrate.ts after db/schema.sql.

CREATE OR REPLACE VIEW `v_invitations_table` AS
/* Select Query */
SELECT
	id,
	invited_by,
	status,
	token,
	expires_at,
	created_at,
	updated_at,
	ref_accounts_id,
	ref_user_id
FROM
    invitations;
/* END Select Query */
