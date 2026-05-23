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
            resolved_user_cte AS (
                SELECT
                    CASE
                        WHEN :accountID IS NOT NULL AND EXISTS (
                            SELECT 1
                            FROM v_account_members_table
                            WHERE account_id = :accountID AND user_id = :userID AND role != 'owner'
                            LIMIT 1
                        )
                        THEN (
                            SELECT user_id
                            FROM v_account_members_table
                            WHERE account_id = :accountID AND role = 'owner'
                            LIMIT 1
                        )
                        ELSE :userID
                    END AS resolved_user_id
            ),
            account_members_cte AS (
                SELECT user_id
                FROM v_account_members_table
                WHERE account_id = :accountID
            ),
            sum_income AS (
                SELECT
                    SUM(amount + transfer_fee) AS total_income
                FROM
                    v_transactions_table
                WHERE
                    ref_user_id IN (SELECT user_id FROM account_members_cte)
                    AND ref_accounts_id = :accountID
                    AND type = 'income'
                    AND (:dateStart IS NULL OR date BETWEEN :dateStart AND :dateEnd)
            ),
            sum_expense AS (
                SELECT
                    SUM(amount + transfer_fee) AS total_expense
                FROM
                    v_transactions_table
                WHERE
                    ref_user_id IN (SELECT user_id FROM account_members_cte)
                    AND ref_accounts_id = :accountID
                    AND type = 'expense'
                    AND (:dateStart IS NULL OR date BETWEEN :dateStart AND :dateEnd)
            ),
            category_details AS (
                SELECT
                    t.ref_categories_id,
                    c.ref_user_id,
                    SUM(t.amount + t.transfer_fee) AS amount
                FROM
                    v_transactions_table t
                JOIN v_categories_table c
                    ON t.ref_categories_id = c.id
                WHERE
                    t.ref_user_id IN (SELECT user_id FROM account_members_cte)
                    AND t.ref_accounts_id = :accountID
                    AND (:dateStart IS NULL OR t.date BETWEEN :dateStart AND :dateEnd)
                GROUP BY
                    t.ref_categories_id,
                    c.ref_user_id
                ORDER BY
                    amount DESC
            )
            SELECT
                :type,
                COALESCE(si.total_income, 0) AS totalIncome,
                COALESCE(se.total_expense, 0) AS totalExpense,
                CASE
                    WHEN EXISTS (
                        SELECT 1
                        FROM v_categories_table c
                        JOIN category_details cd
                            ON c.id = cd.ref_categories_id
                            AND c.ref_user_id = cd.ref_user_id
                        WHERE
                            c.ref_user_id IN (SELECT user_id FROM account_members_cte)
                            AND (:type IS NULL OR c.type = :type)
                        LIMIT 1
                    ) THEN (
                        SELECT 
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
                            )
                        FROM
                            v_categories_table c
                        JOIN category_details cd
                            ON c.id = cd.ref_categories_id
                            AND c.ref_user_id = cd.ref_user_id
                        WHERE
                            c.ref_user_id IN (SELECT user_id FROM account_members_cte)
                            AND (:type IS NULL OR c.type = :type)
                    )
                    ELSE
                        JSON_ARRAY()
                END as details,
                (SELECT resolved_user_id FROM resolved_user_cte) AS refUserID,
                :accountID AS refAccountsID
            FROM sum_income si
            JOIN sum_expense se
            LIMIT 1;`;
};

export const getCategoriesOptions = () => {
  return `WITH
            resolved_user_cte AS (
                SELECT
                    CASE
                        WHEN :accountID IS NOT NULL AND EXISTS (
                            SELECT 1
                            FROM v_account_members_table
                            WHERE account_id = :accountID AND user_id = :userID AND role != 'owner'
                            LIMIT 1
                        )
                        THEN (
                            SELECT user_id
                            FROM v_account_members_table
                            WHERE account_id = :accountID AND role = 'owner'
                            LIMIT 1
                        )
                        ELSE :userID
                    END AS resolved_user_id
            )
            SELECT
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
                ref_user_id = (SELECT resolved_user_id FROM resolved_user_cte)
                AND type = :type
            ORDER BY
                name ASC;`;
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
                c.id,
                c.name,
                c.type,
                c.icon,
                c.description,
                c.refUserID,
                CASE 
                    WHEN 
                        :dateStart IS NOT NULL AND 
                        :dateEnd IS NOT NULL AND
                        :accountID IS NOT NULL
                    THEN(
                        SELECT SUM(amount)
                        FROM v_transactions_table t
                        WHERE t.ref_categories_id = :id
                            AND t.ref_accounts_id = :accountID
                            AND t.date >= :dateStart
                            AND t.date <= :dateEnd
                    )
                    ELSE 0
                END AS totalAmount
            FROM 
                v_categories c
            WHERE
                c.refUserID = :userID
                AND c.id = :id
            LIMIT 1;`;
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
