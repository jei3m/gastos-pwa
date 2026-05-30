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
            SELECT 
                a.id,
                a.name,
                a.type,
                a.description,
                a.totalBalance,
                a.isDropdown,
                JSON_LENGTH(a.ref_user_ids) AS memberCount
            FROM
                v_accounts a
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
                JSON_LENGTH(a.ref_user_ids) AS memberCount
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
