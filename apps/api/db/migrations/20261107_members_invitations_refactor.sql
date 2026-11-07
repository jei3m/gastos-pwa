-- Gastos migration: account_members and invitations ref refactor
-- Applied by db/migrate.ts before views and procedures. Idempotent: once the old
-- columns are gone the procedure skips itself.

DROP PROCEDURE IF EXISTS `migrate_members_invitations`;
CREATE PROCEDURE `migrate_members_invitations`()
main: BEGIN

    IF EXISTS (
        SELECT 1
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'account_members'
            AND COLUMN_NAME = 'account_id'
    ) THEN
        DELETE am
        FROM account_members am
        LEFT JOIN user u
            ON u.id = am.user_id
        WHERE u.id IS NULL;

        ALTER TABLE account_members
            DROP FOREIGN KEY account_members_ibfk_1,
            DROP PRIMARY KEY,
            RENAME COLUMN account_id TO ref_accounts_id,
            RENAME COLUMN user_id TO ref_user_id,
            ADD PRIMARY KEY (ref_accounts_id, ref_user_id),
            ADD KEY fk_user_id_account_members_idx (ref_user_id),
            ADD CONSTRAINT fk_accounts_id_account_members
                FOREIGN KEY (ref_accounts_id) REFERENCES accounts (id) ON DELETE CASCADE,
            ADD CONSTRAINT fk_user_id_account_members
                FOREIGN KEY (ref_user_id) REFERENCES user (id) ON DELETE CASCADE;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'invitations'
            AND COLUMN_NAME = 'invited_email'
    ) THEN
        DELETE FROM invitations
        WHERE status IN ('declined', 'expired');

        DELETE i
        FROM invitations i
        LEFT JOIN accounts a
            ON a.id = i.account_id
        WHERE a.id IS NULL;

        DELETE i
        FROM invitations i
        LEFT JOIN user u
            ON LOWER(u.email) = LOWER(i.invited_email)
        WHERE u.id IS NULL;

        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME = 'invitations'
                AND COLUMN_NAME = 'ref_user_id'
        ) THEN
            ALTER TABLE invitations
                ADD COLUMN ref_user_id varchar(36) NULL AFTER invited_by;
        END IF;

        UPDATE invitations i
        JOIN user u
            ON LOWER(u.email) = LOWER(i.invited_email)
        SET i.ref_user_id = u.id
        WHERE i.ref_user_id IS NULL;

        ALTER TABLE invitations
            DROP COLUMN invited_email,
            CHANGE COLUMN account_id ref_accounts_id char(36) NOT NULL,
            MODIFY COLUMN ref_user_id varchar(36) NOT NULL,
            MODIFY COLUMN status enum('pending', 'accepted') DEFAULT 'pending',
            ADD KEY fk_ref_accounts_id_idx (ref_accounts_id),
            ADD KEY fk_ref_user_id_idx (ref_user_id),
            ADD CONSTRAINT fk_ref_accounts_id
                FOREIGN KEY (ref_accounts_id) REFERENCES accounts (id) ON DELETE CASCADE,
            ADD CONSTRAINT fk_ref_user_id
                FOREIGN KEY (ref_user_id) REFERENCES user (id) ON DELETE CASCADE;
    END IF;
END;
CALL migrate_members_invitations();
DROP PROCEDURE migrate_members_invitations;
