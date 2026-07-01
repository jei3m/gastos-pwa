export const respondToInvitation = () => {
  return `CALL manage_invitations
            (
                'respond_to_invitation',
                NULL,
                :userID,
                NULL,
                NULL,
                NULL,
                :token,
                :invitationAction,
                TRUE,
                @response
            );
            SELECT @response AS response;`;
};

export const getMembers = () => {
  return `SELECT
            am.user_id AS userID,
            u.email,
            u.name,
            u.image,
            am.role
          FROM v_account_members_table am
          JOIN user u ON am.user_id = u.id
          WHERE am.account_id = :accountID
          ORDER BY am.role = 'owner' DESC, u.name ASC`;
};

export const getPendingInvitations = () => {
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

export const getInvitationByToken = () => {
  return `SELECT
            i.id,
            i.account_id AS accountID,
            i.invited_email AS invitedEmail,
            i.status,
            i.expires_at AS expiresAt,
            a.name AS accountName,
            u.name AS inviterName,
            u.email AS inviterEmail
          FROM v_invitations_table i
          JOIN accounts a ON i.account_id = a.id
          JOIN user u ON i.invited_by = u.id
          WHERE i.token = :token
          LIMIT 1`;
};
