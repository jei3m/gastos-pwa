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
       JSON_ARRAYAGG(am.ref_user_id)
      ) > 1 AS isShared
		FROM accounts a
		LEFT JOIN account_members am
			ON a.id = am.ref_accounts_id
		WHERE EXISTS(
      SELECT 1
      FROM account_members am
      WHERE am.ref_accounts_id = a.id
        AND ref_user_id = :userID
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
    WITH pending_invitations_cte AS (
      SELECT
        i.ref_accounts_id AS accountID,
        CASE 
          WHEN a.ref_user_id = :userID THEN
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'id', i.id,
                'accountID', i.ref_accounts_id,
                'image', u.image,
                'name', u.name,
                'email', u.email,
                'invitedBy', i.invited_by,
                'status', i.status,
                'token', i.token,
                'expiresAt', i.expires_at,
                'createdAt', i.created_at
              )
            )
          ELSE JSON_ARRAY()
        END AS invitations
      FROM invitations i
      LEFT JOIN user u
        ON i.ref_user_id = u.id
      LEFT JOIN accounts a
        ON i.ref_accounts_id = a.id
      WHERE i.ref_accounts_id = :id
        AND i.status = 'pending'
      GROUP BY
        i.ref_accounts_id,
        i.created_at
      ORDER BY i.created_at DESC
    )
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
       JSON_ARRAYAGG(am.ref_user_id)
      ) > 1 AS isShared,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'userID', am.ref_user_id,
          'email', u.email,
          'name', COALESCE(u.name, 'Deleted User'),
          'image', COALESCE(u.image, '/images/profile-picture.png'),
          'role', am.role
        )
      ) AS members,
      COALESCE(pic.invitations, JSON_ARRAY()) AS invitations
    FROM accounts a
		LEFT JOIN account_members am
			ON a.id = am.ref_accounts_id
    LEFT JOIN user u
      ON am.ref_user_id = u.id
    LEFT JOIN pending_invitations_cte pic
      ON a.id = pic.accountID
    WHERE a.id = :id
      AND EXISTS(
        SELECT 1
        FROM account_members am
        WHERE am.ref_accounts_id = a.id
          AND ref_user_id = :userID
        LIMIT 1
      )
    GROUP BY
      a.id,
      a.name,
      a.type,
      a.description,
      a.total_balance,
      a.is_dropdown,
      pic.invitations
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
      am.ref_user_id AS userID,
      u.email,
      COALESCE(u.name, 'Deleted User') AS name,
      COALESCE(u.image, '/images/profile-picture.png') AS image,
      am.role
    FROM account_members am
    LEFT JOIN user u ON am.ref_user_id = u.id
    WHERE am.ref_accounts_id = :accountID
    ORDER BY am.role = 'owner' DESC, u.name ASC`;
};

export const getPendingInvitationsQuery = () => {
  return `
    SELECT
      i.id,
      i.ref_accounts_id AS accountID,
      u.email AS invitedEmail,
      i.invited_by AS invitedBy,
      i.status,
      i.token,
      i.expires_at AS expiresAt,
      i.created_at AS createdAt
    FROM invitations i
    JOIN user u ON i.ref_user_id = u.id
    WHERE i.ref_accounts_id = :accountID
      AND i.status = 'pending'
    ORDER BY i.created_at DESC`;
};
