export const getExportData = () => {
  return `
        WITH 
        export_accounts AS (
            SELECT
                a.id,
                a.name,
                a.type,
                a.description,
                a.totalBalance,
                a.isDropdown,
                a.ref_user_id AS refUserID
            FROM
                v_accounts a
            WHERE
                :userID MEMBER OF(a.ref_user_ids)
        ),
        export_categories AS (
            SELECT
                c.id,
                c.name,
                c.type,
                c.icon,
                c.description,
                c.ref_accounts_id AS refAccountsID,
                c.ref_user_id AS refUserID
            FROM
                v_categories_table c
            WHERE
                c.ref_user_id = :userID
                OR c.ref_accounts_id IN (
                    SELECT a.id
                    FROM v_accounts a
                    WHERE :userID MEMBER OF(a.ref_user_ids)
                )
        ),
        export_transactions AS (
            SELECT
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
                v.refUserID,
                t.ref_accounts_id AS refAccountsID,
                c.name AS categoryName,
                c.icon AS categoryIcon,
                c.type AS categoryType,
                a.name AS accountName,
                a.type AS accountType,
                u.name AS userName,
                u.email AS userEmail
            FROM
                v_transaction_details v
            JOIN v_transactions_table t ON v.id = t.id
            LEFT JOIN v_accounts a ON t.ref_accounts_id = a.id
            LEFT JOIN v_categories_table c ON v.refCategoriesID = c.id
            LEFT JOIN v_user_table u ON v.refUserID = u.id
            WHERE
                :userID MEMBER OF(a.ref_user_ids)
                OR v.refUserID = :userID
        )
        SELECT
            JSON_OBJECT(
                'accounts',
                IFNULL(
                    (
                        SELECT JSON_ARRAYAGG(JSON_OBJECT(
                            'id', oa.id,
                            'name', oa.name,
                            'type', oa.type,
                            'description', oa.description,
                            'totalBalance', oa.totalBalance,
                            'isDropdown', oa.isDropdown,
                            'refUserID', oa.refUserID
                        ))
                        FROM (
                            SELECT * FROM export_accounts ORDER BY name ASC
                        ) oa
                    ),
                    JSON_ARRAY()
                ),
                'categories',
                IFNULL(
                    (
                        SELECT JSON_ARRAYAGG(JSON_OBJECT(
                            'id', oc.id,
                            'name', oc.name,
                            'type', oc.type,
                            'icon', oc.icon,
                            'description', oc.description,
                            'refAccountsID', oc.refAccountsID,
                            'refUserID', oc.refUserID
                        ))
                        FROM (
                            SELECT * FROM export_categories ORDER BY type ASC, name ASC
                        ) oc
                    ),
                    JSON_ARRAY()
                ),
                'transactions',
                IFNULL(
                    (
                        SELECT JSON_ARRAYAGG(JSON_OBJECT(
                            'id', ot.id,
                            'note', ot.note,
                            'amount', ot.amount,
                            'transferFee', ot.transferFee,
                            'isTransfer', ot.isTransfer,
                            'type', ot.type,
                            'time', ot.time,
                            'date', ot.date,
                            'refCategoriesID', ot.refCategoriesID,
                            'refTransferToAccountsID', ot.refTransferToAccountsID,
                            'refUserID', ot.refUserID,
                            'refAccountsID', ot.refAccountsID,
                            'categoryName', ot.categoryName,
                            'categoryIcon', ot.categoryIcon,
                            'categoryType', ot.categoryType,
                            'accountName', ot.accountName,
                            'accountType', ot.accountType,
                            'userName', ot.userName,
                            'userEmail', ot.userEmail
                        ))
                        FROM (
                            SELECT * FROM export_transactions ORDER BY date DESC, time DESC
                        ) ot
                    ),
                    JSON_ARRAY()
                )
            ) AS export;
    `;
};
