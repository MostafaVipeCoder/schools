-- 1. Create Grades Table (Independent)
CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  name TEXT NOT NULL,
  stage TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Classes Table (Referenced by Students)
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  name TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  stage TEXT NOT NULL,
  capacity INTEGER DEFAULT 30,
  teacher_name TEXT,
  grade_id UUID REFERENCES grades(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Students Table (References Classes)
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  class_id UUID REFERENCES classes(id),
  guardian_name TEXT NOT NULL,
  guardian_phone TEXT NOT NULL,
  payment_status TEXT CHECK (payment_status IN ('regular', 'exempt')) DEFAULT 'regular',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Attendance Table (References Students)
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  present BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- 5. Create Payments Table (References Students)
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  status TEXT CHECK (status IN ('paid', 'unpaid', 'partial')) DEFAULT 'unpaid',
  payment_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- User Isolation Policies
CREATE POLICY "Users can manage their own grades" ON grades FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage their own classes" ON classes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage their own students" ON students FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage their own attendance" ON attendance FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage their own payments" ON payments FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_attendance_student_id ON attendance(student_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_payments_student_id ON payments(student_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_grades_user_id ON grades(user_id);
CREATE INDEX idx_classes_user_id ON classes(user_id);
CREATE INDEX idx_students_user_id ON students(user_id);
