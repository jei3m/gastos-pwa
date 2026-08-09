export const createAccounts = () => {
  return `CALL manage_accounts
            (
                :actionType,
                :id,
                :userID,
                :name,
                :type,
                :description,
                :isDropdown,
                :emails,
                :cancelInvitationIds,
                :removeMemberIds,
                @response
            );
            SELECT @response AS response;`;
};

export const getAccounts = () => {
  return `
            SELECT
                a.id,
                a.name,
                a.type,
                a.description,
                a.totalBalance,
                a.isDropdown,
                a.ref_user_id = :userID AS isOwner,
                EXISTS (
                    SELECT 1
                    FROM v_transactions_table t
                    WHERE t.ref_accounts_id = a.id
                    AND t.ref_user_id <> a.ref_user_id
                    LIMIT 1
                ) OR JSON_LENGTH(a.ref_user_ids) > 1 AS isShared
            FROM v_accounts a
            WHERE
                :userID MEMBER OF(ref_user_ids)
                AND (:isDropdown IS NULL OR a.isDropdown = :isDropdown) 
            ORDER BY a.name ASC;
        `;
};

export const getAccountByID = () => {
  return `
            SELECT 
                a.id,
                a.name,
                a.type,
                a.description,
                a.totalBalance,
                a.isDropdown,
                a.ref_user_id = :userID AS isOwner,
                EXISTS (
                    SELECT 1
                    FROM v_transactions_table t
                    WHERE t.ref_accounts_id = a.id
                    AND t.ref_user_id <> a.ref_user_id
                    LIMIT 1
                ) OR JSON_LENGTH(a.ref_user_ids) > 1 AS isShared
            FROM
                v_accounts a
            WHERE
                a.id = :id
                AND :userID MEMBER OF(ref_user_ids)
            LIMIT 1;
        `;
};

export const updateAccount = () => {
  return `CALL manage_accounts
            (
                :actionType,
                :id,
                :userID,
                :name,
                :type,
                :description,
                :isDropdown,
                :emails,
                :cancelInvitationIds,
                :removeMemberIds,
                @response
            );
            SELECT @response AS response;`;
};

export const deleteAccount = () => {
  return `CALL manage_accounts
            (
                :actionType,
                :id,
                :userID,
                NULL,
                NULL,
                NULL,
                NULL,
                NULL,
                NULL,
                NULL,
                @response
            );
            SELECT @response AS response;`;
};
