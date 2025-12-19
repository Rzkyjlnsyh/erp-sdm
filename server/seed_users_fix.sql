INSERT INTO users (id, name, username, telegram_id, telegram_username, role, password_hash)
VALUES 
('1', 'Budi Owner',   'owner',   '111', '@budi_owner', 'OWNER',   NULL),
('2', 'Siti Manager', 'manager', '222', '@siti_mgr',   'MANAGER', NULL),
('3', 'Andi Finance', 'finance', '333', '@andi_fin',  'FINANCE', NULL),
('4', 'Joko Staff',   'staff',   '444', '@joko_sdm',   'STAFF',   NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  username = EXCLUDED.username,
  role = EXCLUDED.role;
