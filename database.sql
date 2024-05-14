-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 21, 2023 at 10:05 AM
-- Server version: 10.4.24-MariaDB
-- PHP Version: 8.1.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `accounts`
--

-- --------------------------------------------------------

--
-- Table structure for table `accounts`
--

CREATE TABLE `accounts` (
  `accounts_id` bigint(20) NOT NULL,
  `accounts_company` bigint(20) NOT NULL DEFAULT 0,
  `accounts_branch` bigint(20) NOT NULL DEFAULT 0,
  `accounts_posting_date` date DEFAULT NULL,
  `accounts_posting_month` varchar(255) DEFAULT NULL,
  `accounts_posting_year` varchar(255) DEFAULT NULL,
  `accounts_voucher_type` int(11) NOT NULL DEFAULT 0,
  `accounts_voucher_number` varchar(255) DEFAULT NULL,
  `accounts_narration` varchar(255) DEFAULT NULL,
  `accounts_total_debit` decimal(20,2) NOT NULL DEFAULT 0.00,
  `accounts_total_credit` decimal(20,2) NOT NULL DEFAULT 0.00,
  `accounts_status` tinyint(4) NOT NULL DEFAULT 0 COMMENT '1 = Active, 0 = Inactive',
  `accounts_delete_status` tinyint(4) NOT NULL DEFAULT 0 COMMENT '1 = Delete, 0 = Active',
  `accounts_create_by` bigint(20) DEFAULT NULL,
  `accounts_update_by` bigint(20) DEFAULT NULL,
  `accounts_delete_by` bigint(20) DEFAULT NULL,
  `accounts_delete_at` datetime DEFAULT NULL,
  `accounts_create_at` datetime NOT NULL,
  `accounts_update_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `accounts_details`
--

CREATE TABLE `accounts_details` (
  `accounts_details_id` bigint(20) NOT NULL,
  `accounts_details_company` bigint(20) NOT NULL DEFAULT 0,
  `accounts_details_branch` bigint(20) NOT NULL DEFAULT 0,
  `accounts_details_accounts` bigint(20) NOT NULL DEFAULT 0,
  `accounts_details_posting_date` date DEFAULT NULL,
  `accounts_details_posting_month` varchar(255) DEFAULT NULL,
  `accounts_details_posting_year` varchar(255) DEFAULT NULL,
  `accounts_details_voucher_type` int(11) NOT NULL DEFAULT 0,
  `accounts_details_voucher_number` varchar(255) DEFAULT NULL,
  `accounts_details_narration` varchar(255) DEFAULT NULL,
  `accounts_details_accounts_type` bigint(20) NOT NULL DEFAULT 0,
  `accounts_details_accounts_category` bigint(20) NOT NULL DEFAULT 0,
  `accounts_details_control_group` bigint(20) NOT NULL DEFAULT 0,
  `accounts_details_general_ledger` bigint(20) NOT NULL DEFAULT 0,
  `accounts_details_subsidiary_ledger` bigint(20) NOT NULL DEFAULT 0,
  `accounts_details_debit` decimal(20,2) NOT NULL DEFAULT 0.00,
  `accounts_details_credit` decimal(20,2) NOT NULL DEFAULT 0.00,
  `accounts_details_status` tinyint(4) NOT NULL DEFAULT 0 COMMENT '1 = Active, 0 = Inactive',
  `accounts_details_delete_status` tinyint(4) NOT NULL DEFAULT 0 COMMENT '1 = Delete, 0 = Active',
  `accounts_details_create_by` bigint(20) DEFAULT NULL,
  `accounts_details_update_by` bigint(20) DEFAULT NULL,
  `accounts_details_delete_by` bigint(20) DEFAULT NULL,
  `accounts_details_delete_at` datetime DEFAULT NULL,
  `accounts_details_create_at` datetime NOT NULL,
  `accounts_details_update_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `accounts_links`
--

CREATE TABLE `accounts_links` (
  `accounts_link_id` bigint(20) NOT NULL,
  `accounts_link_company` bigint(20) NOT NULL,
  `accounts_link_code` varchar(255) DEFAULT NULL,
  `accounts_link_name` varchar(255) DEFAULT NULL,
  `accounts_link_accounts` bigint(20) NOT NULL DEFAULT 0,
  `accounts_link_status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '1 = Active, 0 = Inactive',
  `accounts_link_delete_status` tinyint(4) NOT NULL DEFAULT 0 COMMENT '1 = Delete, 0 = Active',
  `accounts_link_create_by` bigint(20) DEFAULT NULL,
  `accounts_link_update_by` bigint(20) DEFAULT NULL,
  `accounts_link_delete_by` bigint(20) DEFAULT NULL,
  `accounts_link_delete_at` datetime DEFAULT NULL,
  `accounts_link_create_at` datetime NOT NULL,
  `accounts_link_update_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `accounts_types`
--

CREATE TABLE `accounts_types` (
  `id` int(11) NOT NULL,
  `accounts_type_id` bigint(20) DEFAULT NULL,
  `accounts_type_code` varchar(255) DEFAULT NULL,
  `accounts_type_name` varchar(255) DEFAULT NULL,
  `accounts_type_status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '1 = Active, 0 = Inactive',
  `accounts_type_delete_status` tinyint(4) NOT NULL DEFAULT 0 COMMENT '1 = Delete, 0 = Active',
  `accounts_type_create_by` bigint(20) DEFAULT NULL,
  `accounts_type_update_by` bigint(20) DEFAULT NULL,
  `accounts_type_delete_by` bigint(20) DEFAULT NULL,
  `accounts_type_delete_at` datetime DEFAULT NULL,
  `accounts_type_create_at` datetime NOT NULL,
  `accounts_type_update_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `accounts_types`
--

INSERT INTO `accounts_types` (`id`, `accounts_type_id`, `accounts_type_code`, `accounts_type_name`, `accounts_type_status`, `accounts_type_delete_status`, `accounts_type_create_by`, `accounts_type_update_by`, `accounts_type_delete_by`, `accounts_type_delete_at`, `accounts_type_create_at`, `accounts_type_update_at`) VALUES
(1, 10000000, '10000000', 'Assets', 1, 0, NULL, NULL, NULL, NULL, '2023-11-21 09:04:49', '2023-11-21 09:04:49'),
(2, 20000000, '20000000', 'Funds & Liabilities', 1, 0, NULL, NULL, NULL, NULL, '2023-11-21 09:04:49', '2023-11-21 09:04:49'),
(3, 30000000, '30000000', 'Income / Revenue', 1, 0, NULL, NULL, NULL, NULL, '2023-11-21 09:04:49', '2023-11-21 09:04:49'),
(4, 40000000, '40000000', 'Expenditure', 1, 0, NULL, NULL, NULL, NULL, '2023-11-21 09:04:49', '2023-11-21 09:04:49');

-- --------------------------------------------------------

--
-- Table structure for table `branches`
--

CREATE TABLE `branches` (
  `branch_id` bigint(20) NOT NULL,
  `branch_company` bigint(20) NOT NULL,
  `branch_code` varchar(255) DEFAULT NULL,
  `branch_name` varchar(255) DEFAULT NULL,
  `branch_phone` varchar(255) DEFAULT NULL,
  `branch_email` varchar(255) DEFAULT NULL,
  `branch_address` text DEFAULT NULL,
  `branch_opening_date` date DEFAULT NULL,
  `branch_status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '1 = Active, 0 = Inactive',
  `branch_delete_status` tinyint(4) NOT NULL DEFAULT 0 COMMENT '1 = Delete, 0 = Active',
  `branch_create_by` bigint(20) DEFAULT NULL,
  `branch_update_by` bigint(20) DEFAULT NULL,
  `branch_delete_by` bigint(20) DEFAULT NULL,
  `branch_delete_at` datetime DEFAULT NULL,
  `branch_create_at` datetime NOT NULL,
  `branch_update_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `chart_of_accounts`
--

CREATE TABLE `chart_of_accounts` (
  `chart_of_accounts_id` bigint(20) NOT NULL,
  `chart_of_accounts_company` bigint(20) NOT NULL,
  `chart_of_accounts_code` varchar(255) DEFAULT NULL,
  `chart_of_accounts_name` varchar(255) DEFAULT NULL,
  `chart_of_accounts_accounts_category` bigint(20) NOT NULL DEFAULT 1,
  `chart_of_accounts_accounts_type` int(11) NOT NULL DEFAULT 0,
  `chart_of_accounts_coa_status` varchar(255) NOT NULL,
  `chart_of_accounts_link` varchar(255) DEFAULT NULL,
  `chart_of_accounts_posting_status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '1 = Auto, 0 = Manual',
  `chart_of_accounts_status` tinyint(4) NOT NULL DEFAULT 0 COMMENT '1 = Active, 0 = Inactive',
  `chart_of_accounts_delete_status` tinyint(4) NOT NULL DEFAULT 0 COMMENT '1 = Delete, 0 = Active',
  `chart_of_accounts_create_by` bigint(20) DEFAULT NULL,
  `chart_of_accounts_update_by` bigint(20) DEFAULT NULL,
  `chart_of_accounts_delete_by` bigint(20) DEFAULT NULL,
  `chart_of_accounts_delete_at` datetime DEFAULT NULL,
  `chart_of_accounts_create_at` datetime NOT NULL,
  `chart_of_accounts_update_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `companies`
--

CREATE TABLE `companies` (
  `company_id` int(11) NOT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `company_owner_name` varchar(255) DEFAULT NULL,
  `company_phone` varchar(255) DEFAULT NULL,
  `company_email` varchar(255) DEFAULT NULL,
  `company_website` varchar(255) DEFAULT NULL,
  `company_address` varchar(255) DEFAULT NULL,
  `company_opening_date` date DEFAULT NULL,
  `company_picture` text DEFAULT NULL,
  `company_company_package` int(11) NOT NULL,
  `company_status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '1 = Active, 0 = Active',
  `company_delete_status` tinyint(4) NOT NULL DEFAULT 0 COMMENT '1 = Delete, 0 = Active',
  `company_create_by` bigint(20) DEFAULT NULL,
  `company_update_by` bigint(20) DEFAULT NULL,
  `company_delete_by` bigint(20) DEFAULT NULL,
  `company_delete_at` datetime DEFAULT NULL,
  `company_create_at` datetime NOT NULL,
  `company_update_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `company_packages`
--

CREATE TABLE `company_packages` (
  `company_package_id` int(11) NOT NULL,
  `company_package_code` varchar(255) DEFAULT NULL,
  `company_package_name` varchar(255) DEFAULT NULL,
  `company_package_status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '1 = Active, 0 = Active',
  `company_package_delete_status` tinyint(4) NOT NULL DEFAULT 0 COMMENT '1 = Delete, 0 = Active',
  `company_package_create_by` bigint(20) DEFAULT NULL,
  `company_package_update_by` bigint(20) DEFAULT NULL,
  `company_package_delete_by` bigint(20) DEFAULT NULL,
  `company_package_delete_at` datetime DEFAULT NULL,
  `company_package_create_at` datetime NOT NULL,
  `company_package_update_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `company_packages`
--

INSERT INTO `company_packages` (`company_package_id`, `company_package_code`, `company_package_name`, `company_package_status`, `company_package_delete_status`, `company_package_create_by`, `company_package_update_by`, `company_package_delete_by`, `company_package_delete_at`, `company_package_create_at`, `company_package_update_at`) VALUES
(1, 'Free', 'Free', 1, 0, NULL, NULL, NULL, NULL, '2023-11-21 09:04:49', '2023-11-21 09:04:49');

-- --------------------------------------------------------

--
-- Table structure for table `financial_years`
--

CREATE TABLE `financial_years` (
  `financial_year_id` bigint(20) NOT NULL,
  `financial_year_company` bigint(20) NOT NULL,
  `financial_year_starting_date` varchar(255) NOT NULL,
  `financial_year_starting_month` varchar(255) NOT NULL,
  `financial_year_closing_date` varchar(255) NOT NULL,
  `financial_year_closing_month` varchar(255) NOT NULL,
  `financial_year_status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '1 = Active, 0 = Inactive',
  `financial_year_delete_status` tinyint(4) NOT NULL DEFAULT 0 COMMENT '1 = Delete, 0 = Active',
  `financial_year_create_by` bigint(20) DEFAULT NULL,
  `financial_year_update_by` bigint(20) DEFAULT NULL,
  `financial_year_delete_by` bigint(20) DEFAULT NULL,
  `financial_year_delete_at` datetime DEFAULT NULL,
  `financial_year_create_at` datetime NOT NULL,
  `financial_year_update_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `reset_passwords`
--

CREATE TABLE `reset_passwords` (
  `reset_password_id` bigint(20) NOT NULL,
  `reset_passwords_user` bigint(20) DEFAULT NULL,
  `reset_passwords_email` varchar(255) DEFAULT NULL,
  `reset_passwords_otp_code` text DEFAULT NULL,
  `reset_passwords_otp_time` datetime DEFAULT NULL,
  `reset_passwords_status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '1 = Active, 0 = Inactive',
  `reset_passwords_create_at` datetime NOT NULL,
  `reset_passwords_update_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `statuses`
--

CREATE TABLE `statuses` (
  `id` int(11) NOT NULL,
  `status_id` bigint(20) DEFAULT NULL,
  `status_code` varchar(255) DEFAULT NULL,
  `status_name` varchar(255) DEFAULT NULL,
  `status_status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '1 = Active, 0 = Inactive',
  `status_delete_status` tinyint(4) NOT NULL DEFAULT 0 COMMENT '1 = Delete, 0 = Active',
  `status_create_by` bigint(20) DEFAULT NULL,
  `status_update_by` bigint(20) DEFAULT NULL,
  `status_delete_by` bigint(20) DEFAULT NULL,
  `status_delete_at` datetime DEFAULT NULL,
  `status_create_at` datetime NOT NULL,
  `status_update_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `statuses`
--

INSERT INTO `statuses` (`id`, `status_id`, `status_code`, `status_name`, `status_status`, `status_delete_status`, `status_create_by`, `status_update_by`, `status_delete_by`, `status_delete_at`, `status_create_at`, `status_update_at`) VALUES
(1, 0, 'I', 'Inactive', 1, 0, NULL, NULL, NULL, NULL, '2023-11-21 09:04:49', '2023-11-21 09:04:49'),
(2, 1, 'A', 'Active', 1, 0, NULL, NULL, NULL, NULL, '2023-11-21 09:04:49', '2023-11-21 09:04:49');

-- --------------------------------------------------------

--
-- Table structure for table `systems`
--

CREATE TABLE `systems` (
  `system_id` int(11) NOT NULL,
  `system_title` varchar(255) DEFAULT NULL,
  `system_name` varchar(255) DEFAULT NULL,
  `system_address` varchar(255) DEFAULT NULL,
  `system_phone` varchar(255) DEFAULT NULL,
  `system_email` varchar(255) DEFAULT NULL,
  `system_website` varchar(255) DEFAULT NULL,
  `system_picture` text DEFAULT NULL,
  `system_status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '1 = Active, 0 = Active',
  `system_delete_status` tinyint(4) NOT NULL DEFAULT 0 COMMENT '1 = Delete, 0 = Active',
  `system_create_by` bigint(20) DEFAULT NULL,
  `system_update_by` bigint(20) DEFAULT NULL,
  `system_delete_by` bigint(20) DEFAULT NULL,
  `system_delete_at` datetime DEFAULT NULL,
  `system_create_at` datetime NOT NULL,
  `system_update_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `systems`
--

INSERT INTO `systems` (`system_id`, `system_title`, `system_name`, `system_address`, `system_phone`, `system_email`, `system_website`, `system_picture`, `system_status`, `system_delete_status`, `system_create_by`, `system_update_by`, `system_delete_by`, `system_delete_at`, `system_create_at`, `system_update_at`) VALUES
(1, 'SS Accounts Manager (SAM)', 'SS Accounts Manager', '', '', '', '', 'assets/images/logo/logo.png', 1, 0, NULL, NULL, NULL, NULL, '2023-11-21 09:04:49', '2023-11-21 09:04:49');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` bigint(20) NOT NULL,
  `user_id_number` varchar(255) DEFAULT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `password` text DEFAULT NULL,
  `password_show` varchar(255) DEFAULT NULL,
  `user_designation` varchar(255) DEFAULT NULL,
  `user_phone` varchar(255) DEFAULT NULL,
  `user_email` varchar(255) DEFAULT NULL,
  `user_address` varchar(255) DEFAULT NULL,
  `user_picture` text DEFAULT NULL,
  `user_company` bigint(20) NOT NULL DEFAULT 0,
  `user_branch` bigint(20) NOT NULL DEFAULT 0,
  `user_user_group` int(11) NOT NULL DEFAULT 0,
  `user_language` varchar(255) DEFAULT NULL,
  `user_theme` varchar(255) DEFAULT NULL,
  `user_status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '1 = Active, 0 = Active',
  `user_delete_status` tinyint(4) NOT NULL DEFAULT 0 COMMENT '1 = Delete, 0 = Active',
  `user_create_by` bigint(20) DEFAULT NULL,
  `user_update_by` bigint(20) DEFAULT NULL,
  `user_delete_by` bigint(20) DEFAULT NULL,
  `user_delete_at` datetime DEFAULT NULL,
  `user_create_at` datetime NOT NULL,
  `user_update_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `user_id_number`, `user_name`, `username`, `password`, `password_show`, `user_designation`, `user_phone`, `user_email`, `user_address`, `user_picture`, `user_company`, `user_branch`, `user_user_group`, `user_language`, `user_theme`, `user_status`, `user_delete_status`, `user_create_by`, `user_update_by`, `user_delete_by`, `user_delete_at`, `user_create_at`, `user_update_at`) VALUES
(1, '0', 'Super Admin', 'sadmin', '$2a$10$9DLzZnLgKUjKKUHk/hqM2eab.e4h8SUXUpCeRXePmLIRRXoF/BKkO', '123456', 'Super Admin', '', '', '', NULL, 0, 0, 1, 'en', 'blue', 1, 0, NULL, NULL, NULL, NULL, '2023-11-21 09:04:49', '2023-11-21 09:04:49');

-- --------------------------------------------------------

--
-- Table structure for table `user_groups`
--

CREATE TABLE `user_groups` (
  `user_group_id` int(11) NOT NULL,
  `user_group_code` varchar(255) DEFAULT NULL,
  `user_group_name` varchar(255) DEFAULT NULL,
  `user_group_status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '1 = Active, 0 = Active',
  `user_group_delete_status` tinyint(4) NOT NULL DEFAULT 0 COMMENT '1 = Delete, 0 = Active',
  `user_group_create_by` bigint(20) DEFAULT NULL,
  `user_group_update_by` bigint(20) DEFAULT NULL,
  `user_group_delete_by` bigint(20) DEFAULT NULL,
  `user_group_delete_at` datetime DEFAULT NULL,
  `user_group_create_at` datetime NOT NULL,
  `user_group_update_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `user_groups`
--

INSERT INTO `user_groups` (`user_group_id`, `user_group_code`, `user_group_name`, `user_group_status`, `user_group_delete_status`, `user_group_create_by`, `user_group_update_by`, `user_group_delete_by`, `user_group_delete_at`, `user_group_create_at`, `user_group_update_at`) VALUES
(1, 'Super Admin', 'Super Admin', 1, 0, NULL, NULL, NULL, NULL, '2023-11-21 09:04:49', '2023-11-21 09:04:49'),
(2, 'System Admin', 'System Admin', 1, 0, NULL, NULL, NULL, NULL, '2023-11-21 09:04:49', '2023-11-21 09:04:49'),
(3, 'Company Admin', 'Company Admin', 1, 0, NULL, NULL, NULL, NULL, '2023-11-21 09:04:49', '2023-11-21 09:04:49'),
(4, 'SA', 'Accounts', 1, 0, NULL, NULL, NULL, NULL, '2023-11-21 09:04:49', '2023-11-21 09:04:49');

-- --------------------------------------------------------

--
-- Table structure for table `voucher_types`
--

CREATE TABLE `voucher_types` (
  `voucher_type_id` bigint(20) NOT NULL,
  `voucher_type_code` varchar(255) DEFAULT NULL,
  `voucher_type_name` varchar(255) DEFAULT NULL,
  `voucher_type_status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '1 = Active, 0 = Inactive',
  `voucher_type_delete_status` tinyint(4) NOT NULL DEFAULT 0 COMMENT '1 = Delete, 0 = Active',
  `voucher_type_create_by` bigint(20) DEFAULT NULL,
  `voucher_type_update_by` bigint(20) DEFAULT NULL,
  `voucher_type_delete_by` bigint(20) DEFAULT NULL,
  `voucher_type_delete_at` datetime DEFAULT NULL,
  `voucher_type_create_at` datetime NOT NULL,
  `voucher_type_update_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `voucher_types`
--

INSERT INTO `voucher_types` (`voucher_type_id`, `voucher_type_code`, `voucher_type_name`, `voucher_type_status`, `voucher_type_delete_status`, `voucher_type_create_by`, `voucher_type_update_by`, `voucher_type_delete_by`, `voucher_type_delete_at`, `voucher_type_create_at`, `voucher_type_update_at`) VALUES
(1, 'RV', 'Receive Voucher', 1, 0, NULL, NULL, NULL, NULL, '2023-11-21 09:04:49', '2023-11-21 09:04:49'),
(2, 'PV', 'Payment Voucher', 1, 0, NULL, NULL, NULL, NULL, '2023-11-21 09:04:49', '2023-11-21 09:04:49'),
(3, '3', 'Journal Voucher', 1, 0, NULL, NULL, NULL, NULL, '2023-11-21 09:04:49', '2023-11-21 09:04:49'),
(4, '4', 'Contra Voucher', 1, 0, NULL, NULL, NULL, NULL, '2023-11-21 09:04:49', '2023-11-21 09:04:49');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accounts`
--
ALTER TABLE `accounts`
  ADD PRIMARY KEY (`accounts_id`);

--
-- Indexes for table `accounts_details`
--
ALTER TABLE `accounts_details`
  ADD PRIMARY KEY (`accounts_details_id`);

--
-- Indexes for table `accounts_links`
--
ALTER TABLE `accounts_links`
  ADD PRIMARY KEY (`accounts_link_id`);

--
-- Indexes for table `accounts_types`
--
ALTER TABLE `accounts_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `branches`
--
ALTER TABLE `branches`
  ADD PRIMARY KEY (`branch_id`);

--
-- Indexes for table `chart_of_accounts`
--
ALTER TABLE `chart_of_accounts`
  ADD PRIMARY KEY (`chart_of_accounts_id`);

--
-- Indexes for table `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`company_id`);

--
-- Indexes for table `company_packages`
--
ALTER TABLE `company_packages`
  ADD PRIMARY KEY (`company_package_id`);

--
-- Indexes for table `financial_years`
--
ALTER TABLE `financial_years`
  ADD PRIMARY KEY (`financial_year_id`);

--
-- Indexes for table `reset_passwords`
--
ALTER TABLE `reset_passwords`
  ADD PRIMARY KEY (`reset_password_id`);

--
-- Indexes for table `statuses`
--
ALTER TABLE `statuses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `systems`
--
ALTER TABLE `systems`
  ADD PRIMARY KEY (`system_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `user_groups`
--
ALTER TABLE `user_groups`
  ADD PRIMARY KEY (`user_group_id`);

--
-- Indexes for table `voucher_types`
--
ALTER TABLE `voucher_types`
  ADD PRIMARY KEY (`voucher_type_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `accounts`
--
ALTER TABLE `accounts`
  MODIFY `accounts_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `accounts_details`
--
ALTER TABLE `accounts_details`
  MODIFY `accounts_details_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `accounts_links`
--
ALTER TABLE `accounts_links`
  MODIFY `accounts_link_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `accounts_types`
--
ALTER TABLE `accounts_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `branches`
--
ALTER TABLE `branches`
  MODIFY `branch_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chart_of_accounts`
--
ALTER TABLE `chart_of_accounts`
  MODIFY `chart_of_accounts_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `companies`
--
ALTER TABLE `companies`
  MODIFY `company_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `company_packages`
--
ALTER TABLE `company_packages`
  MODIFY `company_package_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `financial_years`
--
ALTER TABLE `financial_years`
  MODIFY `financial_year_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reset_passwords`
--
ALTER TABLE `reset_passwords`
  MODIFY `reset_password_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `statuses`
--
ALTER TABLE `statuses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `systems`
--
ALTER TABLE `systems`
  MODIFY `system_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `user_groups`
--
ALTER TABLE `user_groups`
  MODIFY `user_group_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `voucher_types`
--
ALTER TABLE `voucher_types`
  MODIFY `voucher_type_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
