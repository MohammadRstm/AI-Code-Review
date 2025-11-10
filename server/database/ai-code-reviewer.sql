-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 10, 2025 at 09:15 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ai-code-reviewer`
--

-- --------------------------------------------------------

--
-- Table structure for table `codes`
--

CREATE TABLE `codes` (
  `id` int(11) NOT NULL,
  `code` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `codes`
--

INSERT INTO `codes` (`id`, `code`) VALUES
(1, 'def add_numbers(a, b)\n    return a + b'),
(2, 'def divide(a, b):\n    return a * b  # should be division, not multiplication'),
(3, 'function greet(){console.log(\"Hello\")console.log(\"World\")  }'),
(4, 'numbers = [1, 2, 3]\nprint(numbers[5])  # IndexError: list index out of range');

-- --------------------------------------------------------

--
-- Table structure for table `humanreviews`
--

CREATE TABLE `humanreviews` (
  `id` int(11) NOT NULL,
  `code_id` int(11) DEFAULT NULL,
  `issue` text DEFAULT NULL,
  `suggestion` text DEFAULT NULL,
  `sevirity` enum('high','medium','low') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `humanreviews`
--

INSERT INTO `humanreviews` (`id`, `code_id`, `issue`, `suggestion`, `sevirity`) VALUES
(1, 1, 'SyntaxError: Missing colon in function definition.', 'Add a colon at the end of the function definition: def add_numbers(a, b):', 'high'),
(2, 2, 'Logical error: function multiplies instead of dividing.', 'Change multiplication to division: return a / b', 'medium'),
(3, 3, 'Messy code: missing semicolons and inconsistent formatting.', 'Format properly and add semicolons where needed.', 'low'),
(4, 4, 'RuntimeError: Index out of range when accessing numbers[5].', 'Ensure the index exists or handle exceptions.', 'high');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `codes`
--
ALTER TABLE `codes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `humanreviews`
--
ALTER TABLE `humanreviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_code` (`code_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `codes`
--
ALTER TABLE `codes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `humanreviews`
--
ALTER TABLE `humanreviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `humanreviews`
--
ALTER TABLE `humanreviews`
  ADD CONSTRAINT `fk_code` FOREIGN KEY (`code_id`) REFERENCES `codes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
