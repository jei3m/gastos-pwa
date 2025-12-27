# Gastos - Budget Tracker PWA

## Overview

Gastos is a comprehensive budget tracking application designed to help users manage their finances effectively. The app provides a clean, intuitive interface for tracking expenses and income, managing accounts, categorizing transactions, and gaining insights into spending patterns. Built as a Progressive Web App (PWA) with NextJS.

## Features

- **Transaction Management**: Add, edit, and view income and expense transactions with detailed information
- **Account Management**: Create and manage multiple accounts with individual balances
- **Category Tracking**: Organize transactions into customizable income and expense categories
- **Financial Overview**: View total net worth, income vs expenses, and account balances
- **PWA Functionality**: Installable app experience but still browser-based
- **Responsive Design**: Optimized for mobile, tablet, and desktop devices
- **Authentication**: Secure user authentication and session management
- **Date Range Filtering**: Analyze finances within specific time periods
- **Dark/Light Mode**: System-aware theme switching

## Technologies Used

- **Next.js 16**: React framework for production-grade applications
- **TypeScript**: Type-safe JavaScript development
- **Tailwind CSS 4**: Utility-first CSS framework for styling
- **PWA Support**: With `@ducanh2912/next-pwa` for PWA support
- **Better Auth**: Authentication solution for user management
- **TanStack Query**: Server state management and caching
- **ShadCN/UI**: Accessible UI components built on Radix UI
- **Lucide Icons**: Beautiful, consistent icon library
- **MySQL**: Database with `mysql2` driver
- **Zod**: Schema validation
- **React Hook Form**: Form management and validation

## Usage

1. **Authentication**: Sign up or log in to access the application
2. **Add Accounts**: Create accounts (e.g., Checking, Savings, Credit Card) in the Settings section
3. **Create Categories**: Set up income and expense categories in the Settings section
4. **Track Transactions**: Add transactions in the Transactions section by specifying amount, category, date, and note
5. **View Analytics**: Check the Categories section to see spending breakdowns
6. **Monitor Balances**: View account balances and net worth on the Accounts page