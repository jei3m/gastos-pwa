DROP PROCEDURE IF EXISTS `delete_user`;

-- START Stored Procedure Script
DELIMITER $$
CREATE PROCEDURE `delete_user`(

    IN p_user_id CHAR(36),

    OUT p_response JSON
)
main: BEGIN

    DECLARE v_user_email VARCHAR(255);
    DECLARE v_affected_rows INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT email
    INTO v_user_email
    FROM user
    WHERE id = p_user_id
    LIMIT 1;

    DELETE FROM transactions
    WHERE ref_accounts_id IN (
        SELECT id
        FROM accounts
        WHERE ref_user_id = p_user_id
    );

    DELETE FROM categories
    WHERE
        ref_user_id = p_user_id
        OR ref_accounts_id IN (
            SELECT
                id
            FROM
                accounts
            WHERE
                ref_user_id = p_user_id
        );

    DELETE FROM invitations
    WHERE invited_by = p_user_id
        OR (invited_email = v_user_email AND status = 'pending');

    DELETE FROM accounts
    WHERE ref_user_id = p_user_id;

    SET v_affected_rows = ROW_COUNT();

    SET p_response = JSON_OBJECT(
        'responseCode', 200,
        'responseMessage', 'User data deleted successfully',
        'affectedRows', v_affected_rows
    );

    COMMIT;
END $$
DELIMITER ;
-- END Stored Procedure Script
