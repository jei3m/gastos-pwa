export const createAccounts = () => {
    return `CALL manage_accounts
            (
                :actionType,
                :id,
                :userID,
                :name,
                :type,
                :description,
                @response
            );
            SELECT @response AS response;`;
};

export const getAccounts = () => {
    return `SELECT 
                id,
                name,
                type,
                description,
                totalBalance
            FROM
                v_accounts
            WHERE
                ref_user_id = :userID
            ORDER BY name ASC;`
};

export const getAccountByID = () => {
    return `SELECT 
                id,
                id,
                name,
                type,
                description,
                totalBalance
            FROM
                v_accounts
            WHERE
                ref_user_id = :userID
                AND id = :id
            LIMIT 1;`
};

export const updateAccount = () => {
    return `CALL manage_accounts
            (
                :actionType,
                :id,
                :userID,
                :name,
                :type,
                :description,
                @response
            );
            SELECT @response AS response;`;
};

export const deleteAccount = () => {
    return `CALL manage_accounts
            (
                :actionType,
                :id,
                :userID,
                NULL,
                NULL,
                NULL,
                @response
            );
            SELECT @response AS response;`;
};