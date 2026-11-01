export const getInsightsQuery = () => {
  return `WITH
    is_account_member_cte AS (
        SELECT 1 AS authorized
        FROM account_members
        WHERE account_id = :accountID
            AND user_id = :userID
    ),
    totals AS (
        SELECT
            COALESCE(
                SUM(
                    CASE
                        WHEN type = 'income' THEN amount + transfer_fee
                        ELSE 0
                    END
                ),
                0
            ) AS total_income,
            COALESCE(
                SUM(
                    CASE
                        WHEN type = 'expense' THEN amount + transfer_fee
                        ELSE 0
                    END
                ),
                0
            ) AS total_expense
        FROM transactions
        WHERE ref_accounts_id = :accountID
            AND (
                :dateStart IS NULL
                OR date BETWEEN :dateStart AND :dateEnd
            )
    ),
    category_details AS (
        SELECT
            c.id,
            c.icon,
            c.name,
            c.type,
            c.description,
            SUM(
                t.amount + t.transfer_fee
            ) AS amount
        FROM transactions t
        JOIN categories c
            ON t.ref_categories_id = c.id
        JOIN account_members cm
            ON cm.account_id = :accountID
            AND cm.user_id = c.ref_user_id
        WHERE t.ref_accounts_id = :accountID
            AND (
                :dateStart IS NULL
                OR t.date BETWEEN :dateStart AND :dateEnd
            )
        GROUP BY
            c.id,
            c.icon,
            c.name,
            c.type,
            c.description
        ORDER BY amount DESC
    )
    SELECT
        :type AS type,
        t.total_income AS totalIncome,
        t.total_expense AS totalExpense,
        COALESCE(
            (
                SELECT
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', cd.id,
                            'icon', cd.icon,
                            'name', cd.name,
                            'type', cd.type,
                            'description', cd.description,
                            'totalAmount', cd.amount
                        )
                    )
                FROM category_details cd
                WHERE (
                    :type IS NULL
                    OR cd.type = :type
                )
            ),
            JSON_ARRAY()
        ) AS categories
    FROM totals t
    CROSS JOIN is_account_member_cte ismc;`;
};
