
-- Updates for V2 features
-- ALTER TABLE users ADD COLUMN device_id VARCHAR(64);
-- ALTER TABLE projects ADD COLUMN comments_json LONGTEXT;
-- ALTER TABLE leave_requests ADD COLUMN end_date DATE;

-- Full Schema Reference (Updated)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(100) NOT NULL UNIQUE,
  telegram_id VARCHAR(100),
  telegram_username VARCHAR(100),
  role VARCHAR(20) NOT NULL,
  password_hash VARCHAR(255),
  device_id VARCHAR(64)
);

CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  office_lat DOUBLE NOT NULL,
  office_lng DOUBLE NOT NULL,
  office_start_time VARCHAR(10) NOT NULL,
  office_end_time VARCHAR(10) NOT NULL,
  telegram_bot_token TEXT,
  telegram_group_id TEXT,
  telegram_owner_chat_id TEXT,
  company_profile_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  collaborators_json TEXT NOT NULL,
  deadline DATE NOT NULL,
  status VARCHAR(20) NOT NULL,
  tasks_json LONGTEXT NOT NULL,
  comments_json LONGTEXT,
  is_management_only TINYINT(1) NOT NULL DEFAULT 0,
  priority VARCHAR(10) NOT NULL,
  created_by VARCHAR(64) NOT NULL,
  created_at BIGINT NOT NULL,
  CONSTRAINT fk_projects_created_by FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS attendance (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  date VARCHAR(40) NOT NULL,
  time_in VARCHAR(20) NOT NULL,
  time_out VARCHAR(20),
  is_late TINYINT(1) NOT NULL DEFAULT 0,
  late_reason TEXT,
  selfie_url LONGTEXT NOT NULL,
  checkout_selfie_url LONGTEXT,
  location_lat DOUBLE NOT NULL,
  location_lng DOUBLE NOT NULL,
  CONSTRAINT fk_att_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS leave_requests (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  type VARCHAR(20) NOT NULL,
  description TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  attachment_url LONGTEXT,
  status VARCHAR(20) NOT NULL,
  created_at BIGINT NOT NULL,
  CONSTRAINT fk_leave_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(64) PRIMARY KEY,
  date DATE NOT NULL,
  amount BIGINT NOT NULL,
  type VARCHAR(10) NOT NULL,
  category VARCHAR(50),
  description TEXT NOT NULL,
  account VARCHAR(50) NOT NULL,
  image_url LONGTEXT
);

CREATE TABLE IF NOT EXISTS daily_reports (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  date VARCHAR(40) NOT NULL,
  activities_json LONGTEXT NOT NULL,
  CONSTRAINT fk_dr_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS salary_configs (
  user_id VARCHAR(64) PRIMARY KEY,
  basic_salary BIGINT NOT NULL,
  allowance BIGINT NOT NULL,
  meal_allowance BIGINT NOT NULL,
  late_deduction BIGINT NOT NULL,
  CONSTRAINT fk_sal_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS payroll_records (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  month VARCHAR(7) NOT NULL,
  basic_salary BIGINT NOT NULL,
  allowance BIGINT NOT NULL,
  total_meal_allowance BIGINT NOT NULL,
  bonus BIGINT NOT NULL,
  deductions BIGINT NOT NULL,
  net_salary BIGINT NOT NULL,
  is_sent TINYINT(1) NOT NULL DEFAULT 0,
  processed_at BIGINT NOT NULL,
  metadata_json TEXT,
  CONSTRAINT fk_pay_user FOREIGN KEY (user_id) REFERENCES users(id)
);
