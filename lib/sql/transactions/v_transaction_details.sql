CREATE OR REPLACE VIEW `v_transaction_details` AS

/* Select Query */
SELECT
  t.id,
  t.note,
  t.amount,
  t.type,
  DATE_FORMAT(t.time, '%H:%i') AS time,
  DATE_FORMAT(t.date, '%Y-%m-%d') AS date,
  c.id AS refCategoriesID,
  t.ref_user_id AS refUserID
FROM
  transactions t 
LEFT JOIN categories c ON t.ref_categories_id = c.id;
/* END Select Query */