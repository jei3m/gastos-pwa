DROP TRIGGER IF EXISTS `user_AFTER_INSERT`;

-- START Trigger Script
DELIMITER $$
CREATE TRIGGER `user_AFTER_INSERT` 
AFTER INSERT ON `user` 
FOR EACH ROW 
BEGIN
    IF NEW.`id` IS NOT NULL THEN
        -- Insert First Account
        INSERT INTO accounts
        (
            id,
            ref_user_id,
            name,
            type,
            description
        )
        VALUES
        (
            UUID(),
            NEW.`id`,
            'Account',
            'Cash',
            'First cash account'
        );

        -- Insert Default Categories
        INSERT INTO categories(
            id,
            ref_user_id,
            name,
            type,
            description,
            icon
        )
        VALUES
        -- Expense categories
        (
            UUID(),
            NEW.`id`,
            'Grocery',
            'Expense',
            'Grocery Expense',
            'groceries'
        ),
        (
            UUID(),
            NEW.`id`,
            'Others',
            'Expense',
            'Others Expense',
            'ellipsis'
        ),
        (
            UUID(),
            NEW.`id`,
            'Food',
            'Expense',
            'Food Expense',
            'food'
        ),
        (
            UUID(),
            NEW.`id`,
            'Transfer',
            'Expense',
            'Transfer Expense',
            'transfer'
        ),
        (
            UUID(),
            NEW.`id`,
            'Transportation',
            'Expense',
            'Transportation Expense',
            'car'
        ),
        (
            UUID(),
            NEW.`id`,
            'Self Care',
            'Expense',
            'Self Care Expense',
            'health'
        ),
        -- Income categories
        (
            UUID(),
            NEW.`id`,
            'Transfer',
            'Income',
            'Transfer Income',
            'transfer'
        ),
        (
            UUID(),
            NEW.`id`,
            'Savings',
            'Income',
            'Savings Income',
            'savings'
        ),
        (
            UUID(),
            NEW.`id`,
            'Bonus',
            'Income',
            'Bonus Income',
            'gift'
        ),
        (
            UUID(),
            NEW.`id`,
            'Salary',
            'Income',
            'Salary Income',
            'works'
        );
    END IF;
END$$

DELIMITER ;
-- END Trigger Script