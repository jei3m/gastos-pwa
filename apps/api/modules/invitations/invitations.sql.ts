export const respondToInvitationQuery = () => {
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

export const getInvitationByTokenQuery = () => {
  return `SELECT
            i.id,
            i.ref_accounts_id AS accountID,
            iu.email AS invitedEmail,
            i.status,
            i.expires_at AS expiresAt,
            a.name AS accountName,
            u.name AS inviterName,
            u.email AS inviterEmail
          FROM v_invitations_table i
          JOIN accounts a ON i.ref_accounts_id = a.id
          JOIN user u ON i.invited_by = u.id
          JOIN user iu ON i.ref_user_id = iu.id
          WHERE i.token = :token
          LIMIT 1`;
};
