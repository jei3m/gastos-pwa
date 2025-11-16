export const createTransaction = () => {
    return `CALL manage_transactions
            (
                :actionType,
                :uuid,
                :note,
                :amount,
                :type,
                :time,
                :date,
                :accountID,
                :categoryID,
                :userID,
                @response
            );
            SELECT @response AS response;`;
};

export const getTransactions = () => {
    return `SELECT 
                date,
                total,
                details
            FROM
                v_transactions
            WHERE
                userID = :userID
                AND accountID = :accountID
                AND (:dateStart IS NULL OR :dateStart <= date)
                AND (:dateEnd IS NULL OR :dateEnd >= date);`;
};

export const getTransactionByID = () => {
    return `SELECT
                uuid,
                note,
                amount,
                type,
                time,
                date,
                refCategoriesID,
                refUserID
            FROM
                v_transaction_details
            WHERE
                uuid = :uuid
                AND refUserID = :userID
            LIMIT 1;`;
};

export const updateTransaction = () => {
    return `CALL manage_transactions
            (
                :actionType,
                :uuid,
                :note,
                :amount,
                :type,
                :time,
                :date,
                :accountID,
                :categoryID,
                :userID,
                @response
            );
            SELECT @response AS response;`;
};

export const deleteTransaction = () => {
    return `CALL manage_transactions
            (
                :actionType,
                :uuid,
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