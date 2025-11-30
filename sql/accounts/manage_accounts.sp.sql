DROP PROCEDURE IF EXISTS `manage_accounts`;

-- START Stored Procedure Script
DELIMITER $$
CREATE PROCEDURE `manage_accounts`(

    IN p_action_type ENUM('create', 'update', 'delete'),
	IN p_id CHAR(36),
	IN p_user_id CHAR(36),
    IN p_name VARCHAR(10),
    IN p_type ENUM('Cash', 'Digital'),
    IN p_description text,

    OUT p_response JSON
)
main: BEGIN

    DECLARE v_affected_rows INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    CASE p_action_type
        -- Cases: create, update, delete
        WHEN 'create' THEN
            -- INSERT statement
            INSERT INTO accounts
            (
                id,
                ref_user_id,
                name,
                type,
                description
            )
            VALUES
            (
                p_id,
                p_user_id,
                p_name,
                p_type,
                p_description
            );

            SET v_affected_rows = ROW_COUNT();

            IF v_affected_rows > 0 THEN
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
            -- Validate account id
            IF NOT EXISTS
            (
                SELECT 1
                FROM accounts
                WHERE id = p_id
                LIMIT 1
            )
            THEN
                SET p_response = JSON_OBJECT(
                    'responseCode', 404,
                    'responseMessage', 'Account not found with the specified id'
                );
                LEAVE main;
            END IF;

            -- UPDATE Statement
            UPDATE 
                accounts
            SET
               name = p_name,
               type = p_type,
               description = p_description
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
            -- Validated account id
            IF NOT EXISTS
            (
                SELECT 1
                FROM accounts
                WHERE id = p_id
                LIMIT 1
            )
            THEN
                SET p_response = JSON_OBJECT(
                    'responseCode', 404,
                    'responseMessage', 'Account not found with the specified id'
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