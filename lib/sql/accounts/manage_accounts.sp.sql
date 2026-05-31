DROP PROCEDURE IF EXISTS `manage_accounts`;

-- START Stored Procedure Script
DELIMITER $$
CREATE PROCEDURE `manage_accounts`(

    IN p_action_type ENUM('create', 'update', 'delete'),
	IN p_id CHAR(36),
	IN p_user_id CHAR(36),
    IN p_name VARCHAR(10),
    IN p_type ENUM('Cash', 'Digital'),
    IN p_description TEXT,
    IN p_is_dropdown TINYINT,
    IN p_emails JSON,
    IN p_cancel_invitation_ids JSON,
    IN p_remove_member_ids JSON,

    OUT p_response JSON
)
main: BEGIN

    DECLARE v_affected_rows INT;
    DECLARE v_member_role ENUM('owner', 'editor');
    DECLARE v_idx INT DEFAULT 0;
    DECLARE v_total INT DEFAULT 0;
    DECLARE v_email_val VARCHAR(255);
    DECLARE v_invitation_id CHAR(36);
    DECLARE v_token CHAR(36);
    DECLARE v_invite_id CHAR(36);
    DECLARE v_member_id CHAR(36);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    CASE p_action_type
        WHEN 'create' THEN
            INSERT INTO accounts
            (
                id,
                ref_user_id,
                name,
                type,
                description,
                is_dropdown
            )
            VALUES
            (
                p_id,
                p_user_id,
                p_name,
                p_type,
                p_description,
                p_is_dropdown
            );

            SET v_affected_rows = ROW_COUNT();

            IF v_affected_rows > 0 THEN
                INSERT INTO account_members
                (
                    account_id,
                    user_id,
                    role
                )
                VALUES (p_id, p_user_id, 'owner');

                IF p_emails IS NOT NULL AND JSON_LENGTH(p_emails) > 0 THEN
                    SET v_idx = 0;
                    SET v_total = JSON_LENGTH(p_emails);
                    WHILE v_idx < v_total DO
                        SET v_email_val = JSON_UNQUOTE(
                            JSON_EXTRACT(
                                p_emails,
                                CONCAT('$[', v_idx, ']')
                            )
                        );
                        SET v_invitation_id = UUID();
                        SET v_token = UUID();
                        CALL manage_invitations(
                            'invite',
                            p_id,
                            p_user_id,
                            NULL,
                            v_invitation_id,
                            v_email_val,
                            v_token,
                            NULL,
                            TRUE,
                            @invite_response
                        );
                        SET v_idx = v_idx + 1;
                    END WHILE;
                END IF;

                SET p_response = JSON_OBJECT(
                    'responseCode', 200, 
                    'responseMessage', 'Account Successfully Created',
                    'affectedRows', v_affected_rows
                );
            ELSE
                SET p_response = JSON_OBJECT(
                    'responseCode', 500, 
                    'responseMessage', 'Failed to Create Account'
                );
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Failed to Create Account';
            END IF;
            
		WHEN 'update' THEN
            SELECT role INTO v_member_role
            FROM account_members
            WHERE account_id = p_id AND user_id = p_user_id
            LIMIT 1;

            IF v_member_role IS NULL OR v_member_role <> 'owner' THEN
                SET p_response = JSON_OBJECT(
                    'responseCode', 403,
                    'responseMessage', 'Only the account owner can update account details'
                );
                LEAVE main;
            END IF;

            UPDATE 
                accounts
            SET
               name = p_name,
               type = p_type,
               description = p_description,
               is_dropdown = p_is_dropdown
            WHERE 
                ref_user_id = p_user_id
                AND id = p_id
            LIMIT 1;

            SET v_affected_rows = ROW_COUNT();

            IF v_affected_rows > 0 THEN
                IF p_emails IS NOT NULL AND JSON_LENGTH(p_emails) > 0 THEN
                    SET v_idx = 0;
                    SET v_total = JSON_LENGTH(p_emails);
                    WHILE v_idx < v_total DO
                        SET v_email_val = JSON_UNQUOTE(
                            JSON_EXTRACT(
                                p_emails,
                                CONCAT('$[', v_idx, ']')
                            )
                        );
                        SET v_invitation_id = UUID();
                        SET v_token = UUID();
                        
                        CALL manage_invitations(
                            'invite',
                            p_id,
                            p_user_id,
                            NULL,
                            v_invitation_id,
                            v_email_val,
                            v_token,
                            NULL,
                            TRUE,
                            @invite_response
                        );
                        SET v_idx = v_idx + 1;
                    END WHILE;
                END IF;

                IF p_cancel_invitation_ids IS NOT NULL AND JSON_LENGTH(p_cancel_invitation_ids) > 0 THEN
                    SET v_idx = 0;
                    SET v_total = JSON_LENGTH(p_cancel_invitation_ids);
                    WHILE v_idx < v_total DO
                        SET v_invite_id = JSON_UNQUOTE(
                            JSON_EXTRACT(
                                p_cancel_invitation_ids,
                                CONCAT('$[', v_idx, ']')
                            )
                        );
                        CALL manage_invitations(
                            'cancel_invitation',
                            p_id,
                            p_user_id,
                            NULL,
                            v_invite_id,
                            NULL,
                            NULL,
                            NULL,
                            TRUE,
                            @cancel_response
                        );
                        SET v_idx = v_idx + 1;
                    END WHILE;
                END IF;

                IF p_remove_member_ids IS NOT NULL AND JSON_LENGTH(p_remove_member_ids) > 0 THEN
                    SET v_idx = 0;
                    SET v_total = JSON_LENGTH(p_remove_member_ids);
                    WHILE v_idx < v_total DO
                        SET v_member_id = JSON_UNQUOTE(
                            JSON_EXTRACT(
                                p_remove_member_ids,
                                CONCAT('$[', v_idx, ']')
                            )
                        );
                        CALL manage_invitations(
                            'remove_member',
                            p_id,
                            p_user_id,
                            v_member_id,
                            NULL,
                            NULL,
                            NULL,
                            NULL,
                            TRUE,
                            @remove_response
                        );
                        SET v_idx = v_idx + 1;
                    END WHILE;
                END IF;

                SET p_response = JSON_OBJECT(
                    'responseCode', 200,
                    'responseMessage', 'Account Updated Sucessfully'
                );
            ELSE  
                SET p_response = JSON_OBJECT(
                    'responseCode', 500,
                    'responseMessage', 'Failed to Update Account'
                );
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Failed to Update Account';
            END IF;

        WHEN 'delete' THEN
            SELECT role INTO v_member_role
            FROM account_members
            WHERE account_id = p_id AND user_id = p_user_id
            LIMIT 1;

            IF v_member_role IS NULL OR v_member_role <> 'owner' THEN
                SET p_response = JSON_OBJECT(
                    'responseCode', 403,
                    'responseMessage', 'Only the account owner can delete this account'
                );
                LEAVE main;
            END IF;

            -- DELETE query
            DELETE FROM
                accounts
            WHERE 
                id = p_id
                AND ref_user_id = p_user_id
            LIMIT 1;

            SET v_affected_rows = ROW_COUNT();

            IF v_affected_rows > 0 THEN
                SET p_response = JSON_OBJECT(
                    'responseCode', 200,
                    'responseMessage', 'Account Deleted Successfully'
                );
            ELSE
                SET p_response = JSON_OBJECT(
                    'responseCode', 500,
                    'responseMessage', 'Failed to Delete Account'
                );
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Failed to Delete Account';
            END IF;
            
        ELSE
			SET p_response = JSON_OBJECT
                            (
                                'responseCode', 400, 
                                'responseMessage', 'Invalid Action Type'
                            );
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Unsupported action type';
    END CASE;

    COMMIT;
END $$
DELIMITER ;
-- END Stored Procedure Script