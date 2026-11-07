-- Gastos stored procedure: manage_invitations
-- Applied by db/migrate.ts. DELIMITER directives are intentionally omitted; the
-- server parses the compound BEGIN ... END body when the file is executed as a batch.

DROP PROCEDURE IF EXISTS `manage_invitations`;
CREATE PROCEDURE `manage_invitations`(

    IN p_action_type ENUM(
        'invite',
        'remove_member',
        'cancel_invitation',
        'respond_to_invitation'
    ),
    IN p_accounts_id CHAR(36),
    IN p_user_id CHAR(36),
    IN p_target_user_id CHAR(36),
    IN p_invitations_id CHAR(36),
    IN p_invited_email VARCHAR(255),
    IN p_token VARCHAR(36),
    IN p_invitation_action ENUM(
        'accept',
        'decline'
    ),
    IN p_is_internal BOOLEAN,

    OUT p_response JSON
)
main: BEGIN

    DECLARE v_member_role ENUM('owner', 'editor');
    DECLARE v_invited_user_id CHAR(36);
    DECLARE v_affected_rows INT;
    DECLARE v_invite_status VARCHAR(10);
    DECLARE v_invite_user_id CHAR(36);
    DECLARE v_invite_expires_at DATETIME;
    DECLARE v_invite_account_id CHAR(36);
    DECLARE v_is_invited_email_exists TINYINT DEFAULT 0;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        IF NOT p_is_internal THEN
            ROLLBACK;
        END IF;
        RESIGNAL;
    END;

    IF NOT p_is_internal THEN
        START TRANSACTION;
    END IF;

    CASE p_action_type
        WHEN 'invite' THEN
            -- Get role of user
            SELECT role
            INTO v_member_role
            FROM account_members
            WHERE ref_accounts_id = p_accounts_id
                AND ref_user_id = p_user_id
            LIMIT 1;

            -- Validate user role
            IF v_member_role IS NULL OR v_member_role <> 'owner' THEN
                SET p_response = JSON_OBJECT(
                    'responseCode', 403,
                    'responseMessage', 'Only the account owner can invite members'
                );
                LEAVE main;
            END IF;

            -- Get user info from p_invited_email
            SELECT
                1,
                id
            INTO 
                v_is_invited_email_exists,
                v_invited_user_id
            FROM user
            WHERE email = p_invited_email
            LIMIT 1;

            -- Validate invited email if it exists
            IF v_is_invited_email_exists = 0 THEN
                SET p_response = JSON_OBJECT(
                    'responseCode', 404,
                    'responseMessage', 'No user found with this email address'
                );
                LEAVE main;
            END IF;

            IF EXISTS(
                SELECT 1
                FROM account_members
                WHERE ref_accounts_id = p_accounts_id
                    AND ref_user_id = v_invited_user_id
                LIMIT 1
            ) THEN
                SET p_response = JSON_OBJECT(
                    'responseCode', 409,
                    'responseMessage', 'This user is already a member of this account'
                );
                LEAVE main;
            END IF;

            IF EXISTS(
                SELECT 1
                FROM invitations
                WHERE ref_accounts_id = p_accounts_id
                    AND ref_user_id = v_invited_user_id
                    AND status = 'pending'
                LIMIT 1
            ) THEN
                SET p_response = JSON_OBJECT(
                    'responseCode', 409,
                    'responseMessage', 'A pending invitation already exists for this email'
                );
                LEAVE main;
            END IF;

            INSERT INTO invitations (
                id,
                invited_by,
                status,
                token,
                expires_at,
                created_at,
                updated_at,
                ref_accounts_id,
                ref_user_id
            )
            VALUES (
                p_invitations_id,
                p_user_id,
                'pending',
                p_token,
                DATE_ADD(NOW(), INTERVAL 7 DAY),
                NOW(),
                NOW(),
                p_accounts_id,
                v_invited_user_id
            );

            SET v_affected_rows = ROW_COUNT();

            IF v_affected_rows > 0 THEN
                SET p_response = JSON_OBJECT(
                    'responseCode', 200,
                    'responseMessage', 'Invitation created successfully',
                    'id', p_invitations_id,
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
            -- Get role of user executing the action
            SELECT role
            INTO v_member_role
            FROM account_members
            WHERE ref_accounts_id = p_accounts_id
                AND ref_user_id = p_user_id
            LIMIT 1;

            -- Validate user role
            IF v_member_role IS NULL OR v_member_role <> 'owner' THEN
                SET p_response = JSON_OBJECT(
                    'responseCode', 403,
                    'responseMessage', 'Only the account owner can remove members'
                );
                LEAVE main;
            END IF;

            -- Get role of target user (the user being removed)
            SELECT role
            INTO v_member_role
            FROM account_members
            WHERE ref_accounts_id = p_accounts_id
                AND ref_user_id = p_target_user_id
            LIMIT 1;

            -- Validate target user existence
            IF v_member_role IS NULL THEN
                SET p_response = JSON_OBJECT(
                    'responseCode', 404,
                    'responseMessage', 'Member not found'
                );
                LEAVE main;
            END IF;

            -- Validate target user role
            IF v_member_role = 'owner' THEN
                SET p_response = JSON_OBJECT(
                    'responseCode', 403,
                    'responseMessage', 'Cannot remove the account owner'
                );
                LEAVE main;
            END IF;

            -- DELETE target user
            DELETE FROM account_members
            WHERE ref_accounts_id = p_accounts_id
                AND ref_user_id = p_target_user_id
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
                LEAVE main;
            END IF;

        WHEN 'cancel_invitation' THEN

            -- Get role of user
            SELECT role
            INTO v_member_role
            FROM account_members
            WHERE ref_accounts_id = p_accounts_id
                AND ref_user_id = p_user_id
            LIMIT 1;

            -- Validate user role
            IF v_member_role IS NULL OR v_member_role <> 'owner' THEN
                SET p_response = JSON_OBJECT(
                    'responseCode', 403,
                    'responseMessage', 'Only the account owner can manage invitations'
                );
                LEAVE main;
            END IF;

            -- UPDATE invitation status to cancelled
            DELETE FROM invitations
            WHERE id = p_invitations_id
                AND ref_accounts_id = p_accounts_id
                AND status = 'pending'
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
            -- Get invitation details
            SELECT
                i.status,
                i.ref_user_id,
                i.expires_at,
                i.ref_accounts_id
            INTO
                v_invite_status,
                v_invite_user_id,
                v_invite_expires_at,
                v_invite_account_id
            FROM invitations i
            WHERE i.token = p_token
            LIMIT 1;

            -- Validate invitation existence
            IF v_invite_status IS NULL THEN
                SET p_response = JSON_OBJECT(
                    'responseCode', 404,
                    'responseMessage', 'Invitation not found'
                );
                LEAVE main;
            END IF;

            -- Validate if invitation is not pending
            IF v_invite_status <> 'pending' THEN
                SET p_response = JSON_OBJECT(
                    'responseCode', 400,
                    'responseMessage', CONCAT('This invitation has already been ', v_invite_status)
                );
                LEAVE main;
            END IF;

            -- Validate invitation expiry
            IF v_invite_expires_at < NOW() THEN
                DELETE FROM invitations
                WHERE token = p_token
                    AND ref_user_id = p_user_id
                LIMIT 1;

                SET p_response = JSON_OBJECT(
                    'responseCode', 400,
                    'responseMessage', 'This invitation has expired'
                );
                LEAVE main;
            END IF;

            IF v_invite_user_id <> p_user_id THEN
                SET p_response = JSON_OBJECT(
                    'responseCode', 403,
                    'responseMessage', 'This invitation was sent to a different email address'
                );
                LEAVE main;
            END IF;
            
            -- Manage invitation action (accept or decline)
            CASE p_invitation_action
                WHEN 'accept' THEN
                    -- INSERT statement
                    INSERT INTO account_members(
                        ref_accounts_id,
                        ref_user_id,
                        role
                    )
                    VALUES(
                        v_invite_account_id,
                        p_user_id,
                        'editor'
                    );

                    -- Delete statement
                    DELETE FROM invitations
                    WHERE token = p_token
                        AND ref_user_id = p_user_id
                    LIMIT 1;

                    -- Return success response
                    SET p_response = JSON_OBJECT(
                        'responseCode', 200,
                        'responseMessage', 'Invitation accepted successfully',
                        'accountID', v_invite_account_id
                    );
                WHEN 'decline' THEN
                    -- Delete statement
                    DELETE FROM invitations
                    WHERE token = p_token
                        AND ref_user_id = p_user_id
                    LIMIT 1;

                    -- Return success response
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
            END CASE;

        ELSE
            SET p_response = JSON_OBJECT(
                'responseCode', 400,
                'responseMessage', 'Invalid Action Type'
            );
            LEAVE main;
    END CASE;

    IF NOT p_is_internal THEN
        COMMIT;
    END IF;
END;
