-- Insert sample courses
INSERT INTO courses (name, description, price) VALUES
('USMLE Step 1 Prep', 'Comprehensive preparation course for USMLE Step 1 examination', 299.99),
('USMLE Step 2 CK', 'Clinical Knowledge preparation for USMLE Step 2', 349.99),
('USMLE Step 3', 'Final step preparation for USMLE licensing', 399.99),
('MCAT Preparation', 'Complete MCAT preparation course', 249.99);

-- Insert sample admin user (password: admin123)
INSERT INTO users (email, name, password_hash, role) VALUES
('admin@tuterial.com', 'Admin User', '$2b$10$rQZ9QmjlhQZ9QmjlhQZ9Qu', 'admin');
