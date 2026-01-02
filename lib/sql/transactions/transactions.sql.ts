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
                AND (:dateStart IS NULL OR :dateStart <= date)
                AND (:dateEnd IS NULL OR :dateEnd >= date)
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