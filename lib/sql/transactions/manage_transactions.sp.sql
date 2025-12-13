DROP PROCEDURE IF EXISTS `manage_transactions`;

-- START Stored Procedure Script
DELIMITER $$
CREATE PROCEDURE `manage_transactions`(

    IN p_action_type ENUM('create', 'update', 'delete'),
	IN p_id CHAR(36),
	IN p_note VARCHAR(20),
	IN p_amount DECIMAL(12,2),
	IN p_type ENUM('income', 'expense'),
    IN p_time TIME,
    IN p_date DATE,
	IN p_ref_accounts_id CHAR(36),
	IN p_ref_categories_id CHAR(36),
	IN p_ref_user_id CHAR(36),

    OUT p_response JSON
)
main: BEGIN

    DECLARE v_affected_rows INT;
    DECLARE v_total_balance, v_amount DECIMAL(12,2);
    DECLARE v_ref_accounts_id CHAR(36);
    DECLARE v_original_type ENUM('income', 'expense');
    DECLARE v_new_balance DECIMAL(12,2);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

	START TRANSACTION;

	CASE p_action_type

		WHEN 'create' THEN
            -- Get total_balance from accounts
            SELECT
                total_balance
            INTO
                v_total_balance
            FROM
                accounts
            WHERE
                id = p_ref_accounts_id
                AND ref_user_id = p_ref_user_id
            LIMIT 1;
            -- Validate total_balance
            IF v_total_balance + (p_amount * CASE WHEN p_type = 'income' THEN 1 ELSE -1 END) < 0 THEN
                SET p_response = JSON_OBJECT(
                    'responseCode', 500,
                    'responseMessage', 'Amount exceeds the account''s total balance'
                );
                LEAVE main;
            END IF;

            -- INSERT statement
			INSERT INTO transactions(
				id,
				note,
				amount,
				type,
                time,
                date,
                ref_accounts_id,
				ref_categories_id,
				ref_user_id
			)
			VALUES(
				p_id,
				p_note,
				p_amount,
				p_type,
                p_time,
                p_date,
                p_ref_accounts_id,
				p_ref_categories_id,
				p_ref_user_id
			);

			SET v_affected_rows = ROW_COUNT();

			IF v_affected_rows > 0 THEN
                -- Add or subtract to accounts total_balance
                UPDATE
                    accounts
                SET
                    total_balance = v_total_balance + (p_amount * CASE WHEN p_type = 'income' THEN 1 ELSE -1 END)
                WHERE
                    id = p_ref_accounts_id
                    AND ref_user_id = p_ref_user_id
                LIMIT 1;

				SET p_response = JSON_OBJECT(
					'responseCode', 200,
					'responseMessage', 'Transaction Successfully Created'
				);
			ELSE
				SET p_response = JSON_OBJECT(
					'responseCode', 500,
					'responseMessage', 'Failed to Create Transaction'
				);
				LEAVE main;
			END IF;

		WHEN 'update' THEN
            -- Get original transaction details
            SELECT
                amount,
                type,
                ref_accounts_id
            INTO
                v_amount,
                v_original_type,
                v_ref_accounts_id
            FROM
                transactions
            WHERE
                id = p_id
                AND ref_user_id = p_ref_user_id
            LIMIT 1;

            -- Validate transaction id
            IF v_amount IS NULL THEN
                SET p_response = JSON_OBJECT(
                    'responseCode', 404,
                    'responseMessage', 'Transaction not found with the specified id'
                );
                LEAVE main;
            END IF;

            -- Get total balance of the account
            SELECT
                total_balance
            INTO
                v_total_balance
            FROM
                accounts
            WHERE
                id = v_ref_accounts_id
                AND ref_user_id = p_ref_user_id
            LIMIT 1;

            -- Calculate v_new_balance
            SET v_new_balance = v_total_balance
                                - (v_amount * CASE WHEN v_original_type = 'income' THEN 1 ELSE -1 END)
                                + (p_amount * CASE WHEN p_type = 'income' THEN 1 ELSE -1 END);

            -- Validate new total_balance
            IF v_new_balance < 0 THEN
                SET p_response = JSON_OBJECT(
                    'responseCode', 500,
                    'responseMessage', 'Amount exceeds the account''s total balance'
                );
                LEAVE main;
            END IF;

			UPDATE
				transactions
			SET
				note = p_note,
				amount = p_amount,
				type = p_type,
                time = p_time,
                date = p_date,
				ref_categories_id = p_ref_categories_id
			WHERE
				id = p_id
				AND ref_user_id = p_ref_user_id
			LIMIT 1;

			SET v_affected_rows = ROW_COUNT();

            IF v_affected_rows > 0 THEN
                -- Update account balance
                UPDATE
                    accounts
                SET
                    total_balance = v_new_balance
                WHERE
                    id = v_ref_accounts_id
                    AND ref_user_id = p_ref_user_id
                LIMIT 1;

                SET p_response = JSON_OBJECT(
                    'responseCode', 200,
                    'responseMessage', 'Transaction Updated Successfully'
                );
            ELSE
                SET p_response = JSON_OBJECT(
                    'responseCode', 500,
                    'responseMessage', 'Failed to Update Transaction'
                );
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Failed to Update Transaction';
            END IF;

		WHEN 'delete' THEN
            -- Get transaction details
            SELECT
                amount,
                type,
                ref_accounts_id
            INTO
                v_amount,
                v_original_type,
                v_ref_accounts_id
            FROM
                transactions
            WHERE
                id = p_id
                AND ref_user_id = p_ref_user_id
            LIMIT 1;

            -- Validate transaction id
            IF v_amount IS NULL THEN
                SET p_response = JSON_OBJECT(
                    'responseCode', 404,
                    'responseMessage', 'Transaction not found with the specified id'
                );
                LEAVE main;
            END IF;

            -- Get total_balance
            SELECT
                total_balance
            INTO
                v_total_balance
            FROM
                accounts
            WHERE
                id = v_ref_accounts_id
                AND ref_user_id = p_ref_user_id
            LIMIT 1;

            -- Calculate new balance before deleting
            SET v_new_balance = v_total_balance - (v_amount * CASE WHEN v_original_type = 'income' THEN 1 ELSE -1 END);

            -- Validate new total_balance
            IF v_new_balance < 0 THEN
                SET p_response = JSON_OBJECT(
                    'responseCode', 500,
                    'responseMessage', 'Deleting this transaction would result in a negative account balance'
                );
                LEAVE main;
            END IF;

            -- DELETE query
            DELETE FROM
                transactions
            WHERE
                id = p_id
                AND ref_user_id = p_ref_user_id
            LIMIT 1;

            SET v_affected_rows = ROW_COUNT();

            IF v_affected_rows > 0 THEN
                -- Update account balance
                UPDATE
                    accounts
                SET
                    total_balance = v_new_balance
                WHERE
                    id = v_ref_accounts_id
                    AND ref_user_id = p_ref_user_id
                LIMIT 1;

                SET p_response = JSON_OBJECT(
                    'responseCode', 200,
                    'responseMessage', 'Transaction Deleted Successfully'
                );
            ELSE
                SET p_response = JSON_OBJECT(
                    'responseCode', 500,
                    'responseMessage', 'Failed to Delete Transaction'
                );
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Failed to Delete Transaction';
            END IF;

		ELSE
			SET p_response = JSON_OBJECT(
				'responseCode', 500,
				'responseMessage', 'Invalid Action Type'
			);
		LEAVE main;
	END CASE;

	COMMIT;
END $$
DELIMITER ;