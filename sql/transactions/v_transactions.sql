CREATE OR REPLACE VIEW `v_transactions` AS

/* Select Query */
WITH transactions_cte AS (
	SELECT
		t.id,
		t.date,
        t.amount,
        c.name,
        t.note,
        t.type,
        t.time,
        t.ref_user_id,
        t.ref_accounts_id,
        ROW_NUMBER() OVER (PARTITION BY t.date ORDER BY t.time ASC) as time_order
	FROM transactions t
    LEFT JOIN categories c on t.ref_categories_id = c.id
	GROUP BY
		t.id,
		t.date,
        t.amount,
        c.name,
        t.note,
        t.type,
        t.time,
        t.ref_user_id,
        t.ref_accounts_id
)
SELECT
    date,
    CASE
		WHEN SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) > 0
			THEN CONCAT('+', SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END))
		WHEN SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) = 0
			THEN SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END)
		ELSE
			CAST(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) AS CHAR)
    END AS total,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'id', id,
            'category', name,
            'note', note,
            'amount', amount,
            'type', type,
            'time', time
        )
    ) AS details,
    ref_user_id AS userID,
    ref_accounts_id AS accountID
FROM transactions_cte
GROUP BY
	date,
    ref_user_id,
    ref_accounts_id
ORDER BY date DESC;
/* END Select Query */