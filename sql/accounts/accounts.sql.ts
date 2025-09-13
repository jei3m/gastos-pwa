export const createAccounts = () => {
    return `CALL manage_accounts
            (
                :actionType,
                :uuid,
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
                uuid,
                name,
                type,
                description
            FROM
                v_accounts
            WHERE
                ref_user_id = :userID;`
};

export const getAccountByID = () => {
    return `SELECT 
                id,
                uuid,
                name,
                type,
                description
            FROM
                v_accounts
            WHERE
                ref_user_id = :userID
                AND uuid = :uuid
            LIMIT 1;`
};

export const updateAccount = () => {
    return `CALL manage_accounts
            (
                :actionType,
                :uuid,
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
                :uuid,
                :userID,
                NULL,
                NULL,
                NULL,
                @response
            );
            SELECT @response AS response;`;
};