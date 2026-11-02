export const getUserByEmailQuery = () => {
  return `
		SELECT
			u.id,
			u.name,
			u.email,
			u.image
		FROM user u
		WHERE email = :email
		LIMIT 1;`;
};

export const deleteUserQuery = () => {
  return `CALL delete_user(
        :userID,
        @response
    );
    SELECT @response AS response;`;
};
