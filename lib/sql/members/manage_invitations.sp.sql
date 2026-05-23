DROP PROCEDURE IF EXISTS `manage_invitations`;

-- START Stored Procedure Script
DELIMITER $$
CREATE PROCEDURE `manage_invitations`(

    IN p_action_type ENUM('invite', 'remove_member', 'cancel_invitation', 'respond_to_invitation'),
    IN p_account_id CHAR(36),
    IN p_user_id CHAR(36),
    IN p_target_user_id CHAR(36),
    IN p_invitation_id CHAR(36),
    IN p_invited_email VARCHAR(255),
    IN p_token VARCHAR(36),
    IN p_invitation_action VARCHAR(10),

    OUT p_response JSON
)
main: BEGIN

    DECLARE v_member_role ENUM('owner', 'editor');
    DECLARE v_invited_user_id CHAR(36);
    DECLARE v_affected_rows INT;
    DECLARE v_invite_status VARCHAR(10);
    DECLARE v_invite_email VARCHAR(255);
    DECLARE v_invite_expires_at DATETIME;
    DECLARE v_invite_account_id CHAR(36);
    DECLARE v_user_email VARCHAR(255);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    CASE p_action_type
        WHEN 'invite' THEN

            SELECT role INTO v_member_role
            FROM account_members
            WHERE account_id = p_account_id AND user_id = p_user_id
            LIMIT 1;

            IF v_member_role IS NULL OR v_member_role <> 'owner' THEN
                SET p_response = JSON_OBJECT(
                    'responseCode', 403,
                    'responseMessage', 'Only the account owner can invite members'
                );
                LEAVE main;
            END IF;

            SELECT id INTO v_invited_user_id
            FROM user
            WHERE email = p_invited_email
            LIMIT 1;

            IF v_invited_user_id IS NULL THEN
                SET p_response = JSON_OBJECT(
                    'responseCode', 404,
                    'responseMessage', 'No user found with this email address'
                );
                LEAVE main;
            END IF;

            SELECT 1 INTO v_affected_rows
            FROM account_members
            WHERE account_id = p_account_id AND user_id = v_invited_user_id
            LIMIT 1;

            IF v_affected_rows = 1 THEN
                SET p_response = JSON_OBJECT(
                    'responseCode', 409,
                    'responseMessage', 'This user is already a member of this account'
                );
                LEAVE main;
            END IF;

            SET v_affected_rows = 0;

            SELECT 1 INTO v_affected_rows
            FROM invitations
            WHERE account_id = p_account_id AND invited_email = p_invited_email AND status = 'pending'
            LIMIT 1;

            IF v_affected_rows = 1 THEN
                SET p_response = JSON_OBJECT(
                    'responseCode', 409,
                    'responseMessage', 'A pending invitation already exists for this email'
                );
                LEAVE main;
            END IF;

            INSERT INTO invitations (id, account_id, invited_email, invited_by, status, token, expires_at, created_at, updated_at)
            VALUES (p_invitation_id, p_account_id, p_invited_email, p_user_id, 'pending', p_token, DATE_ADD(NOW(), INTERVAL 7 DAY), NOW(), NOW());

            SET v_affected_rows = ROW_COUNT();

            IF v_affected_rows > 0 THEN
                SET p_response = JSON_OBJECT(
                    'responseCode', 200,
                    'responseMessage', 'Invitation created successfully',
                    'id', p_invitation_id,
                    'token', p_token,
                    'invitedEmail', p_invited_email,
                    'expiresAt', DATE_ADD(NOW(), INTERVAL 7 DAY)
                );
            ELSE
                SET p_response = JSON_OBJECT(
                    'responseCode', 500,
                    'responseMessage', 'Failed to create invitation'
                );
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Failed to create invitation';
            END IF;

        WHEN 'remove_member' THEN

            SELECT role INTO v_member_role
            FROM account_members
            WHERE account_id = p_account_id AND user_id = p_user_id
            LIMIT 1;

            IF v_member_role IS NULL OR v_member_role <> 'owner' THEN
                SET p_response = JSON_OBJECT(
                    'responseCode', 403,
                    'responseMessage', 'Only the account owner can remove members'
                );
                LEAVE main;
            END IF;

            SELECT role INTO v_member_role
            FROM account_members
            WHERE account_id = p_account_id AND user_id = p_target_user_id
            LIMIT 1;

            IF v_member_role IS NULL THEN
                SET p_response = JSON_OBJECT(
                    'responseCode', 404,
                    'responseMessage', 'Member not found'
                );
                LEAVE main;
            END IF;

            IF v_member_role = 'owner' THEN
                SET p_response = JSON_OBJECT(
                    'responseCode', 403,
                    'responseMessage', 'Cannot remove the account owner'
                );
                LEAVE main;
            END IF;

            DELETE FROM account_members
            WHERE account_id = p_account_id AND user_id = p_target_user_id
            LIMIT 1;

            SET v_affected_rows = ROW_COUNT();

            IF v_affected_rows > 0 THEN
                SET p_response = JSON_OBJECT(
                    'responseCode', 200,
                    'responseMessage', 'Member removed successfully'
                );
            ELSE
                SET p_response = JSON_OBJECT(
                    'responseCode', 500,
                    'responseMessage', 'Failed to remove member'
                );
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Failed to remove member';
            END IF;

        WHEN 'cancel_invitation' THEN

            SELECT role INTO v_member_role
            FROM account_members
            WHERE account_id = p_account_id AND user_id = p_user_id
            LIMIT 1;

            IF v_member_role IS NULL OR v_member_role <> 'owner' THEN
                SET p_response = JSON_OBJECT(
                    'responseCode', 403,
                    'responseMessage', 'Only the account owner can manage invitations'
                );
                LEAVE main;
            END IF;

            UPDATE invitations
            SET status = 'cancelled', updated_at = NOW()
            WHERE id = p_invitation_id AND account_id = p_account_id AND status = 'pending'
            LIMIT 1;

            SET v_affected_rows = ROW_COUNT();

            IF v_affected_rows > 0 THEN
                SET p_response = JSON_OBJECT(
                    'responseCode', 200,
                    'responseMessage', 'Invitation cancelled successfully'
                );
            ELSE
                SET p_response = JSON_OBJECT(
                    'responseCode', 404,
                    'responseMessage', 'Pending invitation not found'
                );
                LEAVE main;
            END IF;

        WHEN 'respond_to_invitation' THEN

            SELECT i.status, i.invited_email, i.expires_at, i.account_id
            INTO v_invite_status, v_invite_email, v_invite_expires_at, v_invite_account_id
            FROM invitations i
            WHERE i.token = p_token
            LIMIT 1;

            IF v_invite_status IS NULL THEN
                SET p_response = JSON_OBJECT(
                    'responseCode', 404,
                    'responseMessage', 'Invitation not found'
                );
                LEAVE main;
            END IF;

            IF v_invite_status <> 'pending' THEN
                SET p_response = JSON_OBJECT(
                    'responseCode', 400,
                    'responseMessage', CONCAT('This invitation has already been ', v_invite_status)
                );
                LEAVE main;
            END IF;

            IF v_invite_expires_at < NOW() THEN
                UPDATE invitations
                SET status = 'expired', updated_at = NOW()
                WHERE token = p_token
                LIMIT 1;

                SET p_response = JSON_OBJECT(
                    'responseCode', 400,
                    'responseMessage', 'This invitation has expired'
                );
                LEAVE main;
            END IF;

            SELECT email INTO v_user_email
            FROM user
            WHERE id = p_user_id
            LIMIT 1;

            IF v_user_email IS NULL THEN
                SET p_response = JSON_OBJECT(
                    'responseCode', 404,
                    'responseMessage', 'User not found'
                );
                LEAVE main;
            END IF;

            IF LOWER(v_user_email) <> LOWER(v_invite_email) THEN
                SET p_response = JSON_OBJECT(
                    'responseCode', 403,
                    'responseMessage', 'This invitation was sent to a different email address'
                );
                LEAVE main;
            END IF;

            IF p_invitation_action = 'accept' THEN

                INSERT INTO account_members (account_id, user_id, role)
                VALUES (v_invite_account_id, p_user_id, 'editor');

                UPDATE invitations
                SET status = 'accepted', updated_at = NOW()
                WHERE token = p_token
                LIMIT 1;

                SET p_response = JSON_OBJECT(
                    'responseCode', 200,
                    'responseMessage', 'Invitation accepted successfully',
                    'accountID', v_invite_account_id
                );

            ELSEIF p_invitation_action = 'decline' THEN

                UPDATE invitations
                SET status = 'declined', updated_at = NOW()
                WHERE token = p_token
                LIMIT 1;

                SET p_response = JSON_OBJECT(
                    'responseCode', 200,
                    'responseMessage', 'Invitation declined'
                );

            ELSE
                SET p_response = JSON_OBJECT(
                    'responseCode', 400,
                    'responseMessage', 'Invalid action. Must be accept or decline'
                );
                LEAVE main;
            END IF;

        ELSE
            SET p_response = JSON_OBJECT(
                'responseCode', 400,
                'responseMessage', 'Invalid Action Type'
            );
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Unsupported action type';
    END CASE;

    COMMIT;
END $$
DELIMITER ;
-- END Stored Procedure Script
