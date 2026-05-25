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
                @response
            );
            SELECT @response AS response;`;
};

export const getAccounts = () => {
  return `
            WITH v_account_members_table_cte AS (
                SELECT
                    account_id,
                    COUNT(account_id) AS memberCount
                FROM v_account_members_table
                GROUP BY account_id
            )
            SELECT 
                a.id,
                a.name,
                a.type,
                a.description,
                a.totalBalance,
                a.isDropdown,
                COALESCE(m.memberCount, 1) AS memberCount
            FROM
                v_accounts a
            LEFT JOIN v_account_members_table_cte m ON a.id = m.account_id
            WHERE
                a.id IN (
                    SELECT account_id
                    FROM v_account_members_table
                    WHERE user_id = :userID
                )
                AND (:isDropdown IS NULL OR a.isDropdown = :isDropdown) 
            ORDER BY a.name ASC;
        `;
};

export const getAccountByID = () => {
  return `
            WITH v_account_members_table_cte AS (
                SELECT
                    account_id,
                    COUNT(account_id) AS memberCount
                FROM v_account_members_table
                GROUP BY account_id
            )
            SELECT 
                a.id,
                a.name,
                a.type,
                a.description,
                a.totalBalance,
                a.isDropdown,
                COALESCE(m.memberCount, 1) AS memberCount
            FROM
                v_accounts a
            LEFT JOIN v_account_members_table_cte m ON a.id = m.account_id
            WHERE
                a.id = :id
                AND a.id IN (
                    SELECT account_id
                    FROM v_account_members_table
                    WHERE user_id = :userID
                )
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
                @response
            );
            SELECT @response AS response;`;
};

export const inviteMember = () => {
  return `CALL manage_invitations
            (
                'invite',
                :accountID,
                :userID,
                NULL,
                :invitationID,
                :invitedEmail,
                :token,
                NULL,
                @response
            );
            SELECT @response AS response;`;
};

export const removeMemberAccount = () => {
  return `CALL manage_invitations
            (
                'remove_member',
                :accountID,
                :userID,
                :targetUserID,
                NULL,
                NULL,
                NULL,
                NULL,
                @response
            );
            SELECT @response AS response;`;
};

export const cancelInvitationAccount = () => {
  return `CALL manage_invitations
            (
                'cancel_invitation',
                :accountID,
                :userID,
                NULL,
                :invitationID,
                NULL,
                NULL,
                NULL,
                @response
            );
            SELECT @response AS response;`;
};
