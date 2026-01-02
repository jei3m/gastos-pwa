CREATE OR REPLACE VIEW `v_transaction_details` AS

/* Select Query */
SELECT
  t.id,
  t.note,
  t.amount,
  t.transfer_fee AS transferFee,
  t.is_transfer AS isTransfer,
  t.type,
  DATE_FORMAT(t.time, '%H:%i') AS time,
  DATE_FORMAT(t.date, '%Y-%m-%d') AS date,
  c.id AS refCategoriesID,
  t.ref_user_id AS refUserID,
  t.ref_transfer_to_accounts_id AS refTransferToAccountsID
FROM
  transactions t 
LEFT JOIN categories c ON t.ref_categories_id = c.id;
/* END Select Query */