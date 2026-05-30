export const createTransaction = () => {
  return `CALL manage_transactions
            (
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

export const getTransactions = () => {
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
            a.ref_user_ids,
            u.name AS userName,
            u.image AS userImage,
            ROW_NUMBER() OVER (PARTITION BY t.date ORDER BY t.time ASC) as time_order
        FROM v_transactions_table t
        LEFT JOIN v_categories_table c on t.ref_categories_id = c.id
        LEFT JOIN v_accounts a ON t.ref_accounts_id = a.id
        LEFT JOIN v_user_table u ON t.ref_user_id = u.id
        WHERE 
            (:searchTerm IS NULL OR t.note LIKE CONCAT('%', :searchTerm, '%'))
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
            a.ref_user_ids,
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
    WHERE
        ref_accounts_id = :accountID
        AND (:userID MEMBER OF(ref_user_ids)
             OR ref_user_id = :userID)
    GROUP BY
        date,
        ref_accounts_id
    ORDER BY date DESC
    LIMIT :limit
    OFFSET :offset;`};

export const getTransactionsCount = () => {
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
            a.ref_user_ids,
            ROW_NUMBER() OVER (PARTITION BY t.date ORDER BY t.time ASC) as time_order
        FROM v_transactions_table t
        LEFT JOIN v_categories_table c on t.ref_categories_id = c.id
        LEFT JOIN v_accounts a ON t.ref_accounts_id = a.id
        WHERE 
            (:searchTerm IS NULL OR t.note LIKE CONCAT('%', :searchTerm, '%'))
        GROUP BY
            t.id,
            t.date,
            t.amount,
            c.name,
            t.note,
            t.type,
            t.time,
            t.ref_user_id,
            t.ref_accounts_id,
            a.ref_user_ids
        ORDER BY 
            date DESC,
            time DESC
    )
    SELECT
        COUNT(DISTINCT date) AS count
    FROM
        transactions_cte
    WHERE
        ref_accounts_id = :accountID
        AND (:userID MEMBER OF(ref_user_ids)
             OR ref_user_id = :userID);`;
};

export const getTransactionByID = () => {
  return `SELECT
                v.id,
                v.note,
                v.amount,
                v.transferFee,
                v.isTransfer,
                v.type,
                v.time,
                v.date,
                v.refCategoriesID,
                v.refTransferToAccountsID,
                v.refUserID AS refUserID
            FROM
                v_transaction_details v
            JOIN v_transactions_table t ON v.id = t.id
            LEFT JOIN v_accounts a ON t.ref_accounts_id = a.id
            WHERE
                v.id = :id
                AND (v.refUserID = :userID
                     OR :userID MEMBER OF(a.ref_user_ids))
            LIMIT 1;`;
};

export const getTransactionsByCategory = () => {
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
                a.ref_user_ids,
                u.name AS userName,
                u.image AS userImage,
                ROW_NUMBER() OVER (PARTITION BY t.date ORDER BY t.time ASC) as time_order
            FROM v_transactions_table t
            LEFT JOIN v_categories_table c on t.ref_categories_id = c.id
            LEFT JOIN v_accounts a ON t.ref_accounts_id = a.id
            LEFT JOIN v_user_table u ON t.ref_user_id = u.id
            WHERE t.ref_categories_id = :categoryID
                AND t.ref_accounts_id = :accountID
                AND (:userID MEMBER OF(ref_user_ids)
                     OR t.ref_user_id = :userID)
                AND (:dateStart IS NULL OR t.date >= :dateStart)
                AND (:dateEnd IS NULL OR t.date <= :dateEnd)
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
                a.ref_user_ids,
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
        OFFSET :offset;
    `;
};

export const getTransactionsByCategoryCount = () => {
  return `
        SELECT
            COUNT (date) AS count
        FROM (
            SELECT DISTINCT date
            FROM v_transactions_table t
            LEFT JOIN v_accounts a ON t.ref_accounts_id = a.id
            WHERE t.ref_accounts_id = :accountID
                AND t.ref_categories_id = :categoryID
                AND (:userID MEMBER OF(a.ref_user_ids)
                     OR t.ref_user_id = :userID)
                AND (:dateStart IS NULL OR t.date >= :dateStart)
                AND (:dateEnd IS NULL OR t.date <= :dateEnd)
        ) AS date_groups;
    `;
};

export const updateTransaction = () => {
  return `CALL manage_transactions
            (
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

export const deleteTransaction = () => {
  return `CALL manage_transactions
            (
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

export const transferTransaction = () => {
  return `CALL transfer_transaction
            (
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
