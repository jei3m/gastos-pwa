export const deleteUserQuery = () => {
  return `CALL delete_user(
        :userID,
        @response
    );
    SELECT @response AS response;`;
};
