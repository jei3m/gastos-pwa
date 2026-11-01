export const createAccountQuery = () => {
  return `
		CALL manage_accounts(
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
			a.total_balance AS totalBalance,
			a.is_dropdown AS isDropdown,
			a.ref_user_id = :userID AS isOwner,
      EXISTS(
        SELECT 1
        FROM transactions t
        WHERE t.ref_accounts_id = a.id
          AND t.ref_user_id <> a.ref_user_id
        LIMIT 1
      ) OR JSON_LENGTH(
       JSON_ARRAYAGG(am.user_id)
      ) > 1 AS isShared
		FROM accounts a
		LEFT JOIN account_members am
			ON a.id = am.account_id
		WHERE EXISTS(
      SELECT 1
      FROM account_members am
      WHERE am.account_id = a.id
        AND user_id = :userID
      LIMIT 1
    )
			AND (:isDropdown IS NULL OR a.is_dropdown = :isDropdown)
    GROUP BY
      a.id,
      a.name,
      a.type,
      a.description,
      a.total_balance,
      a.is_dropdown
		ORDER BY a.name ASC;`;
};

export const getAccountByIDQuery = () => {
  return `
    SELECT
      a.id,
      a.name,
      a.type,
      a.description,
      a.total_balance AS totalBalance,
      a.is_dropdown AS isDropdown,
      a.ref_user_id = :userID AS isOwner,
      EXISTS(
        SELECT 1
        FROM transactions t
        WHERE t.ref_accounts_id = a.id
          AND t.ref_user_id <> a.ref_user_id
        LIMIT 1
      ) OR JSON_LENGTH(
       JSON_ARRAYAGG(am.user_id)
      ) > 1 AS isShared
    FROM accounts a
		LEFT JOIN account_members am
			ON a.id = am.account_id
    WHERE a.id = :id
      AND EXISTS(
        SELECT 1
        FROM account_members am
        WHERE am.account_id = a.id
          AND user_id = :userID
        LIMIT 1
      )
    GROUP BY
      a.id,
      a.name,
      a.type,
      a.description,
      a.total_balance,
      a.is_dropdown
    LIMIT 1;`;
};

export const updateAccountQuery = () => {
  return `
    CALL manage_accounts(
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
  return `
    CALL manage_accounts(
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
  return `
    SELECT
      am.user_id AS userID,
      u.email,
      COALESCE(u.name, 'Deleted User') AS name,
      COALESCE(u.image, '/images/profile-picture.png') AS image,
      am.role
    FROM account_members am
    LEFT JOIN user u ON am.user_id = u.id
    WHERE am.account_id = :accountID
    ORDER BY am.role = 'owner' DESC, u.name ASC`;
};

export const getPendingInvitationsQuery = () => {
  return `
    SELECT
      i.id,
      i.account_id AS accountID,
      i.invited_email AS invitedEmail,
      i.invited_by AS invitedBy,
      i.status,
      i.token,
      i.expires_at AS expiresAt,
      i.created_at AS createdAt
    FROM invitations i
    WHERE i.account_id = :accountID AND i.status = 'pending'
    ORDER BY i.created_at DESC`;
};
