export const createTransactionQuery = () => {
  return `
		CALL manage_transactions(
			:actionType,
			:id,
			:note,
			:amount,
			NULL,
			:type,
			:time,
			:date,
			:refAccountsID,
			:refCategoriesID,
			:userID,
			@response
		);
		SELECT @response AS response;`;
};

export const getTransactionsQuery = () => {
  return `
		WITH transactions_cte AS (
			SELECT
				t.id,
				t.date,
				(t.amount + t.transfer_fee) AS amount,
				c.name,
				c.icon,
				c.type AS categoryType,
				t.note,
				t.type,
				t.time,
				t.ref_user_id,
				t.ref_accounts_id,
				COALESCE(u.name, 'Deleted User') AS userName,
				COALESCE(u.image, '/images/profile-picture.png') AS userImage,
				ROW_NUMBER() OVER (PARTITION BY t.date ORDER BY t.time ASC) as time_order
			FROM transactions t
			LEFT JOIN categories c
				ON t.ref_categories_id = c.id
			LEFT JOIN user u
				ON t.ref_user_id = u.id
			WHERE (:searchTerm IS NULL OR t.note LIKE CONCAT('%', :searchTerm, '%'))
			GROUP BY
				t.id,
				t.date,
				t.amount,
				c.name,
				c.icon,
				c.type,
				t.note,
				t.type,
				t.time,
				t.ref_user_id,
				t.ref_accounts_id,
				u.name,
				u.image
			ORDER BY
				date DESC,
				time DESC
		)
		SELECT
			date,
			CONCAT('+', SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END)) AS totalIncome,
			CASE
				WHEN SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) > 0
					THEN CONCAT('-', SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END))
				ELSE
					SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END)
			END AS totalExpense,
			CASE
				WHEN SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) > 0
					THEN CONCAT('+', SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END))
				WHEN SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) = 0
					THEN SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END)
				ELSE
					CAST(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) AS CHAR)
			END AS total,
			JSON_ARRAYAGG(
				JSON_OBJECT(
					'id', id,
					'category', name,
					'icon', icon,
					'categoryType', categoryType,
					'note', note,
					'amount', amount,
					'type', type,
					'time', time,
					'userName', userName,
					'userImage', userImage
				)
			) AS details,
			ref_accounts_id AS accountID
		FROM transactions_cte
		WHERE ref_accounts_id = :accountID
			AND EXISTS (
				SELECT 1
				FROM account_members am
				WHERE am.account_id = :accountID
					AND am.user_id = :userID
				LIMIT 1
			)
		GROUP BY
			date,
			ref_accounts_id
		ORDER BY date DESC
		LIMIT :limit
		OFFSET :offset;`;
};

export const getTransactionsCountQuery = () => {
  return `
		WITH transactions_cte AS (
			SELECT
				t.id,
				t.date,
				(t.amount + t.transfer_fee) AS amount,
				c.name,
				t.note,
				t.type,
				t.time,
				t.ref_user_id,
				t.ref_accounts_id,
				ROW_NUMBER() OVER (PARTITION BY t.date ORDER BY t.time ASC) as time_order
			FROM transactions t
			LEFT JOIN categories c
				ON t.ref_categories_id = c.id
			WHERE (:searchTerm IS NULL OR t.note LIKE CONCAT('%', :searchTerm, '%'))
			GROUP BY
				t.id,
				t.date,
				t.amount,
				c.name,
				t.note,
				t.type,
				t.time,
				t.ref_user_id,
				t.ref_accounts_id
			ORDER BY
				date DESC,
				time DESC
		)
		SELECT
			COUNT(DISTINCT date) AS count
		FROM transactions_cte
		WHERE ref_accounts_id = :accountID
			AND EXISTS (
				SELECT 1
				FROM account_members am
				WHERE am.account_id = :accountID
					AND am.user_id = :userID
				LIMIT 1
			);`;
};

export const getTransactionByIDQuery = () => {
  return `
		SELECT
			t.id,
			t.note,
			t.amount,
			t.transfer_fee AS transferFee,
			t.is_transfer AS isTransfer,
			t.type,
			DATE_FORMAT(t.time, '%H:%i') AS time,
			DATE_FORMAT(t.date, '%Y-%m-%d') AS date,
			t.ref_categories_id AS refCategoriesID,
			t.ref_transfer_to_accounts_id AS refTransferToAccountsID,
			t.ref_user_id AS refUserID,
			COALESCE(u.name, 'Deleted User') AS userName,
			COALESCE(u.image, '/images/profile-picture.png') AS userImage,
			ta.name AS transferToAccountName
		FROM transactions t
		LEFT JOIN user u
			ON t.ref_user_id = u.id
		LEFT JOIN accounts ta
			ON t.ref_transfer_to_accounts_id = ta.id
		WHERE t.id = :id
			AND EXISTS (
				SELECT 1
				FROM account_members am
				WHERE am.account_id = t.ref_accounts_id
					AND am.user_id = :userID
				LIMIT 1
			)
		LIMIT 1;`;
};

export const getTransactionsByCategoryQuery = () => {
  return `
		WITH transactions_cte AS (
			SELECT
				t.id,
				t.date,
				(t.amount + t.transfer_fee) AS amount,
				c.name,
				c.icon,
				c.type AS categoryType,
				t.note,
				t.type,
				t.time,
				t.ref_user_id,
				t.ref_accounts_id,
				u.name AS userName,
				u.image AS userImage,
				ROW_NUMBER() OVER (PARTITION BY t.date ORDER BY t.time ASC) as time_order
			FROM transactions t
			LEFT JOIN categories c
				ON t.ref_categories_id = c.id
			LEFT JOIN user u
				ON t.ref_user_id = u.id
			WHERE t.ref_categories_id = :categoryID
				AND t.ref_accounts_id = :accountID
				AND (:dateStart IS NULL OR t.date >= :dateStart)
				AND (:dateEnd IS NULL OR t.date <= :dateEnd)
				AND EXISTS (
					SELECT 1
					FROM account_members am
					WHERE am.account_id = t.ref_accounts_id
						AND am.user_id = :userID
				)
			GROUP BY
				t.id,
				t.date,
				t.amount,
				c.name,
				c.icon,
				c.type,
				t.note,
				t.type,
				t.time,
				t.ref_user_id,
				t.ref_accounts_id,
				u.name,
				u.image
			ORDER BY
				date DESC,
				time DESC
		)
		SELECT
			date,
			CONCAT('+', SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END)) AS totalIncome,
			CASE
					WHEN SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) > 0
						THEN CONCAT('-', SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END))
					ELSE
						SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END)
			END AS totalExpense,
			CASE
				WHEN SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) > 0
					THEN CONCAT('+', SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END))
				WHEN SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) = 0
					THEN SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END)
				ELSE
					CAST(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) AS CHAR)
			END AS total,
			JSON_ARRAYAGG(
				JSON_OBJECT(
						'id', id,
						'category', name,
						'icon', icon,
						'categoryType', categoryType,
						'note', note,
						'amount', amount,
						'type', type,
						'time', time,
						'userName', userName,
						'userImage', userImage
				)
			) AS details,
			ref_accounts_id AS accountID
		FROM transactions_cte
		GROUP BY
			date,
			ref_accounts_id
		ORDER BY date DESC
		LIMIT :limit
		OFFSET :offset;`;
};

export const getTransactionsByCategoryCountQuery = () => {
  return `
		SELECT
			COUNT(date) AS count
		FROM (
			SELECT DISTINCT date
			FROM transactions t
			WHERE t.ref_accounts_id = :accountID
				AND t.ref_categories_id = :categoryID
				AND (:dateStart IS NULL OR t.date >= :dateStart)
				AND (:dateEnd IS NULL OR t.date <= :dateEnd)
				AND EXISTS (
					SELECT 1
					FROM account_members am
					WHERE am.account_id = t.ref_accounts_id
						AND am.user_id = :userID
					LIMIT 1
				)
		) AS date_groups;`;
};

export const updateTransactionQuery = () => {
  return `
		CALL manage_transactions(
			:actionType,
			:id,
			:note,
			:amount,
			:transferFee,
			:type,
			:time,
			:date,
			:refAccountsID,
			:refCategoriesID,
			:userID,
			@response
		);
		SELECT @response AS response;`;
};

export const deleteTransactionQuery = () => {
  return `
		CALL manage_transactions(
			:actionType,
			:id,
			NULL,
			NULL,
			NULL,
			NULL,
			NULL,
			NULL,
			NULL,
			NULL,
			:userID,
			@response
		);
		SELECT @response AS response;`;
};

export const transferTransactionQuery = () => {
  return `
		CALL transfer_transaction(
			:actionType,
			:id,
			:note,
			:amount,
			:transferFee,
			:time,
			:date,
			:refAccountsID,
			:refTransferToAccountsID,
			:userID,
			@response
		);
		SELECT @response AS response;`;
};
