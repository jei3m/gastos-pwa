DROP PROCEDURE IF EXISTS `manage_categories`;

-- START Stored Procedure Script
DELIMITER $$
CREATE PROCEDURE `manage_categories`(
    IN p_action_type ENUM('create', 'update', 'delete'),
    IN p_uuid CHAR(36),
    IN p_user_id CHAR(36),
    IN p_name VARCHAR(15),
    IN p_type ENUM('Income','Expense'),

    OUT p_response JSON
)
BEGIN
    DECLARE v_affected_rows INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    main: BEGIN
        CASE p_action_type
            WHEN 'create' THEN
                -- INSERT statement
                INSERT INTO categories(
                    uuid,
                    ref_user_id,
                    name,
                    type
                )
                VALUES(
                    p_uuid,
                    p_user_id,
                    p_name,
                    p_type
                );

                SET v_affected_rows = ROW_COUNT();

                IF v_affected_rows > 0 THEN
                    SET p_response = JSON_OBJECT(
                        'uuid', p_uuid,
                        'responseCode', 200,
                        'responseMessage', 'Category Created Successfully'
                    );
                ELSE
                    SET p_response = JSON_OBJECT(
                        'responseCode', 500,
                        'responseMessage', 'Failed to Create Category'
                    );
                    LEAVE main;
                END IF;

            WHEN 'update' THEN
                -- Validate category uuid
                IF NOT EXISTS(
                    SELECT 1
                    FROM categories
                    WHERE uuid = p_uuid
                    LIMIT 1
                ) THEN
                    SET p_response = JSON_OBJECT(
                        'responseCode', 404,
                        'responseMessage', 'Category not found with the specified UUID'
                    );
                    LEAVE main;
                END IF;

                -- UPDATE Statement
                UPDATE categories
                SET 
                    name = p_name,
                    type = p_type
                WHERE
                    ref_user_id = p_user_id
                    AND uuid = p_uuid
                LIMIT 1;

                SET v_affected_rows = ROW_COUNT();

                IF v_affected_rows > 0 THEN
                    SET p_response = JSON_OBJECT(
                        'responseCode', 200,
                        'responseMessage', 'Category Updated Successfully'
                    );
                ELSE
                    SET p_response = JSON_OBJECT(
                        'responseCode', 500,
                        'responseMessage', 'Failed to Update Category'
                    );
                    LEAVE main;
                END IF;

            WHEN 'delete' THEN
                -- Validate category uuid
                IF NOT EXISTS(
                    SELECT 1
                    FROM categories
                    WHERE uuid = p_uuid
                    LIMIT 1
                ) THEN
                    SET p_response = JSON_OBJECT(
                        'responseCode', 404,
                        'responseMessage', 'Category not found with the specified UUID'
                    );
                    LEAVE main;
                END IF;

                -- DELETE Statement
                DELETE FROM 
                    categories
                WHERE
                    uuid = p_uuid
                    AND ref_user_id = p_user_id
                LIMIT 1;

                SET v_affected_rows = ROW_COUNT();

                IF v_affected_rows > 0 THEN
                    SET p_response = JSON_OBJECT(
                        'responseCode', 200,
                        'responseMessage', 'Category Deleted Successfully'
                    );
                ELSE
                    SET p_response = JSON_OBJECT(
                        'responseCode', 500,
                        'responseMessage', 'Failed to Delete Category'
                    );
                    LEAVE main;
                END IF;
                
            ELSE 
                SET p_response = JSON_OBJECT(
                    'responseCode', 500,
                    'responseMessage', 'Invalid Action Type'
                );
                LEAVE main;
        END CASE;
    END main;

    COMMIT;
END $$
DELIMITER ;