CREATE OR REPLACE VIEW `v_account_members_table` AS

/* Select Query */
SELECT 
	account_id,
	user_id,
	role,
	joined_at
FROM 
    account_members;
/* END Select Query */