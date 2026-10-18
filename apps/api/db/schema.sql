-- Gastos database schema (tables only)
-- Applied by db/migrate.ts. Views, procedures and triggers live in
-- db/views/, db/procedures/ and db/triggers/ respectively.

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- Better Auth tables
-- ============================================================

CREATE TABLE IF NOT EXISTS `user` (
  `id` varchar(36) NOT NULL,
  `name` text NOT NULL,
  `email` varchar(255) NOT NULL,
  `emailVerified` tinyint(1) NOT NULL,
  `image` text,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `session` (
  `id` varchar(36) NOT NULL,
  `expiresAt` datetime NOT NULL,
  `token` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `ipAddress` text,
  `userAgent` text,
  `userId` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `account` (
  `id` varchar(36) NOT NULL,
  `accountId` text NOT NULL,
  `providerId` text NOT NULL,
  `userId` varchar(36) NOT NULL,
  `accessToken` text,
  `refreshToken` text,
  `idToken` text,
  `accessTokenExpiresAt` datetime DEFAULT NULL,
  `refreshTokenExpiresAt` datetime DEFAULT NULL,
  `scope` text,
  `password` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `verification` (
  `id` varchar(36) NOT NULL,
  `identifier` text NOT NULL,
  `value` text NOT NULL,
  `expiresAt` datetime NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- Domain tables
-- ============================================================

CREATE TABLE IF NOT EXISTS `accounts` (
  `id` char(36) NOT NULL,
  `name` varchar(10) NOT NULL,
  `type` enum('Cash','Digital') NOT NULL,
  `description` text,
  `total_balance` decimal(12,2) DEFAULT '0.00',
  `is_dropdown` tinyint DEFAULT '1',
  `ref_user_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid_UNIQUE` (`id`),
  KEY `fk_user_id_accounts_idx` (`ref_user_id`),
  CONSTRAINT `fk_user_id_accounts` FOREIGN KEY (`ref_user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `account_members` (
  `account_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `role` enum('owner','editor') NOT NULL DEFAULT 'editor',
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`account_id`,`user_id`),
  CONSTRAINT `account_members_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `categories` (
  `id` char(45) NOT NULL,
  `name` varchar(15) NOT NULL,
  `type` enum('Income','Expense') NOT NULL,
  `description` text,
  `icon` varchar(20) NOT NULL,
  `ref_accounts_id` char(36) DEFAULT NULL,
  `ref_user_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid_UNIQUE` (`id`),
  KEY `fk_user_id_categories_idx` (`ref_user_id`),
  KEY `fk_accounts_id_categories_idx` (`ref_accounts_id`),
  CONSTRAINT `fk_accounts_id_categories` FOREIGN KEY (`ref_accounts_id`) REFERENCES `accounts` (`id`),
  CONSTRAINT `fk_user_id_categories` FOREIGN KEY (`ref_user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `transactions` (
  `id` char(36) NOT NULL,
  `note` varchar(30) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `transfer_fee` decimal(12,2) NOT NULL DEFAULT '0.00',
  `is_transfer` tinyint NOT NULL DEFAULT '0',
  `type` enum('income','expense') NOT NULL,
  `time` time NOT NULL,
  `date` date NOT NULL,
  `ref_accounts_id` char(36) DEFAULT NULL,
  `ref_categories_id` char(36) NOT NULL,
  `ref_user_id` varchar(36) NOT NULL,
  `ref_transfer_to_accounts_id` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_categories_id_idx` (`ref_categories_id`),
  KEY `fk_accounts_id_transactions_idx` (`ref_accounts_id`),
  KEY `note_idx` (`note`),
  CONSTRAINT `fk_accounts_id_transactions` FOREIGN KEY (`ref_accounts_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_categories_id_transactions` FOREIGN KEY (`ref_categories_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `invitations` (
  `id` char(36) NOT NULL,
  `account_id` char(36) NOT NULL,
  `invited_email` varchar(255) NOT NULL,
  `invited_by` char(36) NOT NULL,
  `status` enum('pending','accepted','declined','expired') DEFAULT 'pending',
  `token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
