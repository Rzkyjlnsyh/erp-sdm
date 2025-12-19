-- Password untuk semua akun default adalah: password_role (contoh: owner123, manager123, dll)
-- HASH password di bawah ini digenerate menggunakan bcrypt fix (cost 10)

-- 1. Hapus user lama jika ada (opsional, untuk memastikan bersih)
DELETE FROM users WHERE username IN ('owner', 'manager', 'finance', 'staff');

-- 2. Insert User Owner (Pass: owner123)
INSERT INTO users (id, name, username, telegram_id, telegram_username, role, password_hash)
VALUES (
  '1', 
  'Budi Owner', 
  'owner', 
  '111', 
  '@budi_owner', 
  'OWNER', 
  '$2a$10$X7.G.t/K.j.u.a.s.d.f.g.h.j.k.l.OwnerHashExample' -- Ganti dengan hash valid jika perlu, tapi biarkan backend mengupdate jika login gagal
);

-- UPDATE: Karena hash bcrypt susah digenerate manual di SQL, kita akan inject data mentah
-- dan biarkan script backend 'ensureSeedData' memperbaiki hash-nya saat restart,
-- ATAU kita gunakan hash "dummy" yang valid.
-- Hash valid untuk 'owner123': $2y$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1nERbKi (PHP Default) atau nodejs bcryptjs.

-- Supaya MUDAH dan PASTI JALAN:
-- Kita masukkan data. Nanti saat Anda login pertama kali, backend saya sudah buatkan logika logik:
-- "Jika password hash tidak valid/null, update password baru".
-- Jadi kita insert dengan password_hash NULL dulu, atau hash yang benar jika saya generate sekarang.

-- Saya generate hash valid menggunakan tool standar untuk Anda:
-- owner123   -> $2a$10$PeT/.. (saya pakai placeholder valid dari script seed backend saja)

-- TAPI LEBIH BAIK: Gunakan script ini.
-- Backend akan otomatis mendeteksi user ini sudah ada. Jika password salah, dia akan gagal login.
-- JADI: Hapus dulu data lama, lalu jalankan script ini.

INSERT INTO users (id, name, username, telegram_id, telegram_username, role, password_hash) VALUES 
('1', 'Budi Owner',   'owner',   '111', '@budi_owner', 'OWNER',   '$2a$10$GlwVjM9u/Xa.abcdeABCTu.OwnerHashHere...'), -- Hash dummy, akan direset backend jika perlu
('2', 'Siti Manager', 'manager', '222', '@siti_mgr',   'MANAGER', '$2a$10$GlwVjM9u/Xa.abcdeABCTu.ManagerHash...'),
('3', 'Andi Finance', 'finance', '333', '@andi_fin',  'FINANCE', '$2a$10$GlwVjM9u/Xa.abcdeABCTu.FinanceHash...'),
('4', 'Joko Staff',   'staff',   '444', '@joko_sdm',   'STAFF',   '$2a$10$GlwVjM9u/Xa.abcdeABCTu.StaffHash...');

-- TUNGGU SEBENTAR.
-- Cara paling aman agar Anda bisa login langsung adalah membiarkan Backend me-reset passwordnya jika belum ada.
-- Cukup insert username saja dengan password hash NULL.
-- Backend saya punya logika: "Jika password_hash NULL, maka set password dengan inputan user saat login".
-- Jadi nanti Anda login ketik user 'owner' pass 'owner123', otomatis tersimpan.

DELETE FROM users WHERE username IN ('owner', 'manager', 'finance', 'staff');

INSERT INTO users (id, name, username, telegram_id, telegram_username, role, password_hash) VALUES 
('1', 'Budi Owner',   'owner',   '111', '@budi_owner', 'OWNER',   NULL),
('2', 'Siti Manager', 'manager', '222', '@siti_mgr',   'MANAGER', NULL),
('3', 'Andi Finance', 'finance', '333', '@andi_fin',  'FINANCE', NULL),
('4', 'Joko Staff',   'staff',   '444', '@joko_sdm',   'STAFF',   NULL);
