DROP PROCEDURE IF EXISTS `manage_accounts`;

-- START Stored Procedure Script
DELIMITER $$
CREATE PROCEDURE `manage_accounts`(

    IN p_action_type ENUM('create', 'update', 'delete'),
	IN p_uuid CHAR(36),
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

    CASE p_action_type

        WHEN 'create' THEN
            -- INSERT statement
            INSERT INTO accounts
            (
                uuid,
                ref_user_id,
                name,
                type,
                description
            )
            VALUES
            (
                p_uuid,
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
			SET p_response = JSON_OBJECT
                            (
                                'responseCode', 400, 
                                'responseMessage', 'Update'
                            );
        WHEN 'delete' THEN
			SET p_response = JSON_OBJECT
                            (
                                'responseCode', 400, 
                                'responseMessage', 'Delete'
                            );
            
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