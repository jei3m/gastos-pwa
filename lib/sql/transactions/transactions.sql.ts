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
  return `SELECT
                date,
                total,
                totalIncome,
                totalExpense,
                details
            FROM
                v_transactions
            WHERE
                userID = :userID
                AND accountID = :accountID
            LIMIT :limit
            OFFSET :offset;`;
};

export const getTransactionByID = () => {
  return `SELECT
                id,
                note,
                amount,
                transferFee,
                isTransfer,
                type,
                time,
                date,
                refCategoriesID,
                refTransferToAccountsID
            FROM
                v_transaction_details
            WHERE
                id = :id
                AND refUserID = :userID
            LIMIT 1;`;
};

export const getTransactionsCount = () => {
  return `SELECT
                COUNT(date) AS count
            FROM
                v_transactions
            WHERE
                userID = :userID
                AND accountID = :accountID;`;
};

export const getTransactionsByCategory = () => {
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
            FROM v_transactions_table t
            LEFT JOIN v_categories_table c on t.ref_categories_id = c.id
            WHERE t.ref_categories_id = :categoryID
                AND t.ref_user_id = :userID
                AND t.ref_accounts_id = :accountID
                AND (:dateStart IS NULL OR t.date >= :dateStart)
                AND (:dateEnd IS NULL OR t.date <= :dateEnd)
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
                    'note', note,
                    'amount', amount,
                    'type', type,
                    'time', time
                )
            ) AS details,
            ref_user_id AS userID,
            ref_accounts_id AS accountID
        FROM transactions_cte
        GROUP BY
            date,
            ref_user_id,
            ref_accounts_id
        ORDER BY date DESC;
    `;
};

export const getTransactionsByCategoryCount = () => {
  return `
        SELECT DISTINCT
            COUNT (date) AS count
        FROM v_transactions_table
        WHERE ref_user_id = :userID
            AND ref_accounts_id = :accountID
            AND ref_categories_id = :categoryID
            AND (:dateStart IS NULL OR date >= :dateStart)
            AND (:dateEnd IS NULL OR date <= :dateEnd);
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
