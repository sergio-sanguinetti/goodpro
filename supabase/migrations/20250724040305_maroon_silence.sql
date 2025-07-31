-- 🔐 Políticas RLS básicas (ejecutar después de crear tablas)

-- Políticas para companies
CREATE POLICY "admins_can_view_all_companies" ON companies FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

CREATE POLICY "company_users_can_view_own_company" ON companies FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.company_id = companies.id
  )
);

CREATE POLICY "admins_can_insert_companies" ON companies FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

CREATE POLICY "admins_can_update_companies" ON companies FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Políticas para users
CREATE POLICY "users_can_view_own_profile" ON users FOR SELECT TO authenticated USING (
  users.id = auth.uid()
);

CREATE POLICY "admins_can_view_all_users" ON users FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid() 
    AND u.role = 'admin'
  )
);

CREATE POLICY "admins_can_insert_users" ON users FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

CREATE POLICY "users_can_update_own_profile" ON users FOR UPDATE TO authenticated USING (
  users.id = auth.uid()
);

CREATE POLICY "admins_can_update_all_users" ON users FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid() 
    AND u.role = 'admin'
  )
);

-- Políticas para projects
CREATE POLICY "admins_can_view_all_projects" ON projects FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

CREATE POLICY "company_users_can_view_company_projects" ON projects FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.company_id = projects.company_id
  )
);

CREATE POLICY "admins_can_insert_projects" ON projects FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

CREATE POLICY "admins_can_update_projects" ON projects FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- ✅ POLÍTICAS RLS BÁSICAS APLICADAS
SELECT '✅ Políticas RLS básicas configuradas correctamente' as resultado;