-- Enable UUID extension (optional but good practice)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  telegram_id VARCHAR(255),
  telegram_username VARCHAR(255),
  role VARCHAR(50) NOT NULL, -- OWNER, MANAGER, FINANCE, STAFF
  password_hash VARCHAR(255),
  device_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SETTINGS Table
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  office_lat DOUBLE PRECISION,
  office_lng DOUBLE PRECISION,
  office_start_time VARCHAR(20),
  office_end_time VARCHAR(20),
  telegram_bot_token VARCHAR(255),
  telegram_group_id VARCHAR(255),
  telegram_owner_chat_id VARCHAR(255),
  company_profile_json TEXT -- JSON string
);

-- PROJECTS Table
CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  collaborators_json TEXT, -- JSON Array of user IDs
  deadline DATE,
  status VARCHAR(50) DEFAULT 'TODO', -- TODO, IN_PROGRESS, DONE, etc.
  tasks_json TEXT, -- JSON Array of tasks
  comments_json TEXT, -- JSON Array of comments
  is_management_only SMALLINT DEFAULT 0, -- 0 or 1
  priority VARCHAR(20) DEFAULT 'NORMAL',
  created_by VARCHAR(255),
  created_at BIGINT
);

-- ATTENDANCE Table
CREATE TABLE IF NOT EXISTS attendance (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id),
  date VARCHAR(20) NOT NULL,
  time_in VARCHAR(20),
  time_out VARCHAR(20),
  is_late SMALLINT DEFAULT 0,
  late_reason TEXT,
  selfie_url TEXT,
  checkout_selfie_url TEXT,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- LEAVE REQUESTS Table
CREATE TABLE IF NOT EXISTS leave_requests (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id),
  type VARCHAR(50), -- SAKIT, IZIN, CUTI
  description TEXT,
  start_date DATE,
  end_date DATE,
  attachment_url TEXT,
  status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
  created_at BIGINT
);

-- TRANSACTIONS Table
CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(255) PRIMARY KEY,
  date DATE,
  amount NUMERIC(15, 2),
  type VARCHAR(10), -- IN, OUT
  category VARCHAR(100),
  description TEXT,
  account VARCHAR(50) DEFAULT 'MAIN',
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DAILY REPORTS Table
CREATE TABLE IF NOT EXISTS daily_reports (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id),
  date VARCHAR(20),
  activities_json TEXT, -- JSON Array
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SALARY CONFIGS Table
CREATE TABLE IF NOT EXISTS salary_configs (
  user_id VARCHAR(255) PRIMARY KEY REFERENCES users(id),
  basic_salary NUMERIC(15, 2) DEFAULT 0,
  allowance NUMERIC(15, 2) DEFAULT 0,
  meal_allowance NUMERIC(15, 2) DEFAULT 0,
  late_deduction NUMERIC(15, 2) DEFAULT 0
);

-- PAYROLL RECORDS Table
CREATE TABLE IF NOT EXISTS payroll_records (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id),
  month VARCHAR(10), -- YYYY-MM
  basic_salary NUMERIC(15, 2),
  allowance NUMERIC(15, 2),
  total_meal_allowance NUMERIC(15, 2),
  bonus NUMERIC(15, 2),
  deductions NUMERIC(15, 2),
  net_salary NUMERIC(15, 2),
  is_sent SMALLINT DEFAULT 0,
  processed_at BIGINT,
  metadata_json TEXT
);
