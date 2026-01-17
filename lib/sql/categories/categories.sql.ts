export const createCategory = () => {
  return `CALL manage_categories
            (
                :actionType,
                :id,
                :userID,
                :name,
                :type,
                :icon,
                :description,
                @response
            );
            SELECT @response AS response;`;
};

export const getCategories = () => {
  return `WITH 
                sum_income AS (
                    SELECT
                        ref_user_id,
                        ref_accounts_id,
                        SUM(amount) AS total_income
                    FROM
                        v_transactions_table
                    WHERE
                        ref_user_id = :userID
                        AND ref_accounts_id = :accountID
                        AND type = 'income'
                        AND (:dateStart IS NULL OR date BETWEEN :dateStart AND :dateEnd)
                    GROUP BY
                        ref_user_id,
                        ref_accounts_id
                ),
                sum_expense AS (
                    SELECT
                        ref_user_id,
			            ref_accounts_id,
                        SUM(amount + transfer_fee) AS total_expense
                    FROM
                        v_transactions_table
                    WHERE
                        ref_user_id = :userID
                        AND ref_accounts_id = :accountID
                        AND type = 'expense'
                        AND (:dateStart IS NULL OR date BETWEEN :dateStart AND :dateEnd)
                    GROUP BY
                        ref_user_id,
                        ref_accounts_id
                ),
                category_details AS (
                    SELECT
                        ref_categories_id,
                        ref_user_id,
                        SUM(amount + transfer_fee) AS amount
                    FROM
                        v_transactions_table
                    WHERE
                        ref_user_id = :userID
                        AND ref_accounts_id = :accountID
                        AND (:dateStart IS NULL OR date BETWEEN :dateStart AND :dateEnd)
                    GROUP BY
                        ref_categories_id,
                        ref_user_id
                    ORDER BY
                        amount DESC
                )
            SELECT
                c.type,
                COALESCE(si.total_income, 0) AS totalIncome,
                COALESCE(se.total_expense, 0) AS totalExpense,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', c.id,
                        'icon', c.icon,
                        'name', c.name,
                        'type', c.type,
                        'description', c.description,
                        'totalAmount', COALESCE(cd.amount, 0),
                        'refUserID', c.ref_user_id,
                        'refAccountsID', :accountID
                    )
                ) AS details,
                c.ref_user_id AS refUserID,
                :accountID AS refAccountsID
            FROM 
                v_categories_table c
            JOIN category_details cd 
                ON c.id = cd.ref_categories_id
                AND c.ref_user_id = cd.ref_user_id
            LEFT JOIN sum_income si
                ON c.ref_user_id = si.ref_user_id 
            LEFT JOIN sum_expense se
                ON c.ref_user_id = se.ref_user_id 
            WHERE
                c.ref_user_id = :userID
                AND (:type IS NULL OR c.type = :type)
            GROUP BY
                c.type,
                si.total_income,
                se.total_expense,
                c.ref_user_id;`;
};

export const getCategoriesList = () => {
  return `SELECT
                id,
                name,
                type,
                icon,
                description,
                ref_accounts_id AS refAccountsID,
                ref_user_id AS refUserID
            FROM
                v_categories_table
            WHERE
                ref_user_id = :userID
                AND type = :type
            ORDER BY
                name ASC;`;
};

export const getCategoryByID = () => {
  return `SELECT
                id,
                name,
                type,
                icon,
                description,
                refUserID
            FROM 
                v_categories
            WHERE
                refUserID = :userID
                AND id = :id;`;
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
                :description,
                @response
            );
            SELECT @response AS response;`;
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
                NULL,
                @response
            );
            SELECT @response AS response;`;
};
