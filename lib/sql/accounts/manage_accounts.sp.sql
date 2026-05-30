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

    OUT p_response JSON
)
main: BEGIN

    DECLARE v_affected_rows INT;
    DECLARE v_member_role ENUM('owner', 'editor');

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
                INSERT INTO account_members (account_id, user_id, role)
                VALUES (p_id, p_user_id, 'owner');

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