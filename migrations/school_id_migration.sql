-- Migration: Add school_id to core tables and update RLS policies
-- This enables multi-user collaboration within the same school

-- Step 1: Add school_id columns to tables
ALTER TABLE grades ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES school_settings(school_id);
ALTER TABLE classes ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES school_settings(school_id);
ALTER TABLE students ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES school_settings(school_id);

-- Step 2: Backfill school_id from user's profile
-- For grades
UPDATE grades g
SET school_id = p.school_id
FROM profiles p
WHERE g.user_id = p.id AND g.school_id IS NULL;

-- For classes
UPDATE classes c
SET school_id = p.school_id
FROM profiles p
WHERE c.user_id = p.id AND c.school_id IS NULL;

-- For students
UPDATE students s
SET school_id = p.school_id
FROM profiles p
WHERE s.user_id = p.id AND s.school_id IS NULL;

-- Step 3: Make school_id NOT NULL after backfill
ALTER TABLE grades ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE classes ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE students ALTER COLUMN school_id SET NOT NULL;

-- Step 4: Drop old RLS policies
DROP POLICY IF EXISTS "Users can manage their own grades" ON grades;
DROP POLICY IF EXISTS "Users can manage their own classes" ON classes;
DROP POLICY IF EXISTS "Users can manage their own students" ON students;
DROP POLICY IF EXISTS "Users can manage their own attendance" ON attendance;
DROP POLICY IF EXISTS "Users can manage their own payments" ON payments;

-- Step 5: Create new school-based RLS policies
-- Grades: Users can access grades in their school
CREATE POLICY "School members can manage grades" ON grades
FOR ALL
USING (
  school_id IN (
    SELECT school_id FROM profiles WHERE id = auth.uid()
  )
)
WITH CHECK (
  school_id IN (
    SELECT school_id FROM profiles WHERE id = auth.uid()
  )
);

-- Classes: Users can access classes in their school
CREATE POLICY "School members can manage classes" ON classes
FOR ALL
USING (
  school_id IN (
    SELECT school_id FROM profiles WHERE id = auth.uid()
  )
)
WITH CHECK (
  school_id IN (
    SELECT school_id FROM profiles WHERE id = auth.uid()
  )
);

-- Students: Users can access students in their school
CREATE POLICY "School members can manage students" ON students
FOR ALL
USING (
  school_id IN (
    SELECT school_id FROM profiles WHERE id = auth.uid()
  )
)
WITH CHECK (
  school_id IN (
    SELECT school_id FROM profiles WHERE id = auth.uid()
  )
);

-- Attendance: Users can access attendance for students in their school
CREATE POLICY "School members can manage attendance" ON attendance
FOR ALL
USING (
  student_id IN (
    SELECT id FROM students WHERE school_id IN (
      SELECT school_id FROM profiles WHERE id = auth.uid()
    )
  )
)
WITH CHECK (
  student_id IN (
    SELECT id FROM students WHERE school_id IN (
      SELECT school_id FROM profiles WHERE id = auth.uid()
    )
  )
);

-- Payments: Users can access payments for students in their school
CREATE POLICY "School members can manage payments" ON payments
FOR ALL
USING (
  student_id IN (
    SELECT id FROM students WHERE school_id IN (
      SELECT school_id FROM profiles WHERE id = auth.uid()
    )
  )
)
WITH CHECK (
  student_id IN (
    SELECT id FROM students WHERE school_id IN (
      SELECT school_id FROM profiles WHERE id = auth.uid()
    )
  )
);

-- Step 6: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_grades_school_id ON grades(school_id);
CREATE INDEX IF NOT EXISTS idx_classes_school_id ON classes(school_id);
CREATE INDEX IF NOT EXISTS idx_students_school_id ON students(school_id);

-- Step 7: Admin bypass policies (admins can see everything)
CREATE POLICY "Admins can manage all grades" ON grades
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can manage all classes" ON classes
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can manage all students" ON students
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can manage all attendance" ON attendance
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can manage all payments" ON payments
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
);
