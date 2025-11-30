export const createCategory = () => {
    return `CALL manage_categories
            (
                :actionType,
                :id,
                :userID,
                :accountID,
                :name,
                :type,
                :icon,
                @response
            );
            SELECT @response AS response;`
};

export const getCategories = () => {
    return `WITH 
                sum_income AS (
                    SELECT
                        SUM(amount) AS total_income
                    FROM
                        v_transactions_table
                    WHERE
                        ref_user_id = :userID
                        AND type = 'income'
                        AND (:dateStart IS NULL OR :dateStart <= date)
                        AND (:dateEnd IS NULL OR :dateEnd >= date)
                ),
                sum_expense AS (
                    SELECT
                        SUM(amount) AS total_expense
                    FROM
                        v_transactions_table
                    WHERE
                        ref_user_id = :userID
                        AND type = 'expense'
                        AND (:dateStart IS NULL OR :dateStart <= date)
                        AND (:dateEnd IS NULL OR :dateEnd >= date)
                ),
                transaction_details AS (
                    SELECT
                        ref_categories_id,
                        SUM(amount) AS amount
                    FROM
                        v_transactions_table
                    WHERE
                        ref_user_id = :userID
                        AND (:dateStart IS NULL OR :dateStart <= date)
                        AND (:dateEnd IS NULL OR :dateEnd >= date)
                    GROUP BY
                        ref_categories_id
                )
            SELECT
                c.type,
                si.total_income AS totalIncome,
                se.total_expense AS totalExpense,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', c.id,
                        'icon', c.icon,
                        'name', c.name,
                        'type', c.type,
                        'totalAmount', td.amount,
                        'refUserID', c.ref_user_id,
                        'refAccountsID', c.ref_accounts_id
                    )
                ) AS details,
                c.ref_user_id AS refUserID,
                c.ref_accounts_id AS refAccountsID
            FROM 
                v_categories_table c
            LEFT JOIN transaction_details td ON c.id = td.ref_categories_id
            JOIN sum_income si
            JOIN sum_expense se 
            WHERE
                c.ref_user_id = :userID
                AND c.ref_accounts_id = :accountID
                AND (:filter IS NULL OR c.type = :filter)
            GROUP BY
                c.type,
                si.total_income,
                se.total_expense,
                c.ref_user_id,
                c.ref_accounts_id;`;
};

export const getCategoryByID = () => {
    return `SELECT
                id,
                name,
                type,
                icon,
                refUserID
            FROM 
                v_categories
            WHERE
                refUserID = :userID
                AND id = :id;`
};

export const updateCategory = () => {
    return `CALL manage_categories
            (
                :actionType,
                :id,
                :userID,
                :name,
                :type,
                :icon,
                @response
            );
            SELECT @response AS response;`
};

export const deleteCategory = () => {
    return `CALL manage_categories
            (
                :actionType,
                :id,
                :userID,
                NULL,
                NULL,
                NULL,
                @response
            );
            SELECT @response AS response;`
};