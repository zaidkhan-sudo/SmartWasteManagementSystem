-- Create database
CREATE DATABASE IF NOT EXISTS smart_waste_db;
USE smart_waste_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  role ENUM('citizen', 'collector', 'admin') DEFAULT 'citizen',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- Bins table
CREATE TABLE IF NOT EXISTS bins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  location VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  type ENUM('general', 'recyclable', 'organic', 'hazardous') DEFAULT 'general',
  capacity INT DEFAULT 100,
  fill_level INT DEFAULT 0,
  status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_location (location),
  INDEX idx_status (status),
  INDEX idx_fill_level (fill_level)
);

-- Schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bin_id INT NOT NULL,
  collector_id INT,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME DEFAULT '09:00:00',
  status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
  route TEXT,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (bin_id) REFERENCES bins(id) ON DELETE CASCADE,
  FOREIGN KEY (collector_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_scheduled_date (scheduled_date)
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bin_id INT NOT NULL,
  user_id INT NOT NULL,
  issue_type ENUM('overflow', 'damage', 'missing', 'odor', 'other') NOT NULL,
  description TEXT NOT NULL,
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  status ENUM('pending', 'in_progress', 'resolved', 'rejected') DEFAULT 'pending',
  resolution_notes TEXT,
  resolved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (bin_id) REFERENCES bins(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_priority (priority)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info', 'warning', 'alert', 'success') DEFAULT 'info',
  related_entity_type VARCHAR(50),
  related_entity_id INT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read),
  INDEX idx_type (type)
);

-- Insert sample admin user (password: admin123)
INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@smartwaste.com', '$2a$10$xQZ5zYZ5zYZ5zYZ5zYZ5zeuL3kXKx8K8K8K8K8K8K8K8K8K8K8K8', 'admin');

-- Insert sample collector user (password: collector123)
INSERT INTO users (name, email, password, phone, role) VALUES 
('John Collector', 'collector@smartwaste.com', '$2a$10$xQZ5zYZ5zYZ5zYZ5zYZ5zeuL3kXKx8K8K8K8K8K8K8K8K8K8K8K8', '+1234567890', 'collector');

-- Insert sample citizen user (password: citizen123)
INSERT INTO users (name, email, password, phone, address) VALUES 
('Jane Citizen', 'citizen@smartwaste.com', '$2a$10$xQZ5zYZ5zYZ5zYZ5zYZ5zeuL3kXKx8K8K8K8K8K8K8K8K8K8K8K8', '+0987654321', '123 Main Street', 'citizen');

-- Insert sample bins
INSERT INTO bins (location, latitude, longitude, type, capacity, fill_level, status) VALUES
('Main Street & 5th Avenue', 40.7128, -74.0060, 'general', 100, 45, 'active'),
('Park Plaza', 40.7589, -73.9851, 'recyclable', 100, 78, 'active'),
('Downtown Market', 40.7306, -73.9352, 'organic', 100, 92, 'active'),
('Central Hospital', 40.7614, -73.9776, 'hazardous', 50, 25, 'active'),
('School District 5', 40.7489, -73.9680, 'general', 100, 55, 'active'),
('Shopping Mall', 40.7549, -73.9840, 'recyclable', 150, 88, 'active'),
('Residential Area A', 40.7410, -74.0030, 'general', 100, 15, 'active'),
('Beach Side', 40.7282, -73.9942, 'general', 100, 35, 'active');

-- Insert sample schedules
INSERT INTO schedules (bin_id, collector_id, scheduled_date, scheduled_time, status) VALUES
(1, 2, CURDATE(), '09:00:00', 'pending'),
(2, 2, CURDATE(), '10:00:00', 'pending'),
(3, 2, CURDATE(), '11:00:00', 'pending'),
(4, 2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:00:00', 'pending'),
(5, 2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:30:00', 'pending');

-- Insert sample reports
INSERT INTO reports (bin_id, user_id, issue_type, description, priority, status) VALUES
(3, 3, 'overflow', 'The bin at Downtown Market is overflowing with organic waste', 'high', 'pending'),
(2, 3, 'odor', 'Strong smell coming from the recyclable bin at Park Plaza', 'medium', 'pending'),
(6, 3, 'overflow', 'Shopping Mall bin needs immediate attention', 'critical', 'in_progress');