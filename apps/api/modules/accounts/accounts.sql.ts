export const createAccountQuery = () => {
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

export const getAccountsQuery = () => {
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

export const getAccountByIDQuery = () => {
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

export const updateAccountQuery = () => {
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

export const deleteAccountQuery = () => {
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

export const getMembersQuery = () => {
  return `SELECT
            am.user_id AS userID,
            u.email,
            COALESCE(u.name, 'Deleted User') AS name,
            COALESCE(u.image, '/images/profile-picture.png') AS image,
            am.role
          FROM v_account_members_table am
          LEFT JOIN user u ON am.user_id = u.id
          WHERE am.account_id = :accountID
          ORDER BY am.role = 'owner' DESC, u.name ASC`;
};

export const getPendingInvitationsQuery = () => {
  return `SELECT
            i.id,
            i.account_id AS accountID,
            i.invited_email AS invitedEmail,
            i.invited_by AS invitedBy,
            i.status,
            i.token,
            i.expires_at AS expiresAt,
            i.created_at AS createdAt
          FROM v_invitations_table i
          WHERE i.account_id = :accountID AND i.status = 'pending'
          ORDER BY i.created_at DESC`;
};
