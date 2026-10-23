export const createCategoryQuery = () => {
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

export const getCategoriesOptionsQuery = () => {
  return `WITH
            account_info_cte AS (
                SELECT ref_user_id AS owner_id, ref_user_ids
                FROM v_accounts
                WHERE id = :accountID
            ),
            resolved_user_cte AS (
                SELECT
                    CASE
                        WHEN :accountID IS NOT NULL
                             AND :userID MEMBER OF((SELECT ref_user_ids FROM account_info_cte))
                             AND :userID != (SELECT owner_id FROM account_info_cte)
                        THEN (SELECT owner_id FROM account_info_cte)
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

export const getCategoriesListQuery = () => {
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

export const getCategoryByIDQuery = () => {
  return `WITH
            account_info_cte AS (
                SELECT ref_user_id AS owner_id, ref_user_ids
                FROM v_accounts
                WHERE id = :accountID
            ),
            resolved_user_cte AS (
                SELECT
                    CASE
                        WHEN :accountID IS NOT NULL
                             AND :userID MEMBER OF((SELECT ref_user_ids FROM account_info_cte))
                             AND :userID != (SELECT owner_id FROM account_info_cte)
                        THEN (SELECT owner_id FROM account_info_cte)
                        ELSE :userID
                    END AS resolved_user_id
            )
            SELECT
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
                c.refUserID = (SELECT resolved_user_id FROM resolved_user_cte)
                AND c.id = :id
            LIMIT 1;`;
};

export const updateCategoryQuery = () => {
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

export const deleteCategoryQuery = () => {
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
