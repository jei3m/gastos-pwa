CREATE OR REPLACE VIEW `v_user_table` AS

/* Select Query */
SELECT
  id,
  name,
  email,
  emailVerified,
  image
FROM
	user;
/* END Select Query */
