CREATE OR REPLACE VIEW `v_accounts` AS

/* Select Query */
SELECT 
    a.id,
    a.ref_user_id,
    a.name,
    a.type,
    a.description,
    a.total_balance AS totalBalance,
    a.is_dropdown AS isDropdown,
    JSON_ARRAYAGG(
        am.user_id
    ) AS ref_user_ids
FROM accounts a
LEFT JOIN account_members am ON a.id = am.account_id
GROUP BY a.id, a.ref_user_id, a.name, a.type, a.description, a.total_balance, a.is_dropdown;
/* END Select Query */