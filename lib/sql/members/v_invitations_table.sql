CREATE OR REPLACE VIEW `v_invitations_table` AS

/* Select Query */
SELECT 
	id,
	account_id,
	invited_email,
	invited_by,
	status,
	token,
	expires_at,
	created_at,
	updated_at
FROM 
    invitations;
/* END Select Query */