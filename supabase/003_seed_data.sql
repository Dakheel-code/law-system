-- ============================================================
-- Seed test data for the law office system
-- Run this once in Supabase SQL Editor (after schema.sql + 002_staff.sql)
-- Safe to re-run: skips if test data already exists.
-- ============================================================

DO $$
DECLARE
  -- staff
  staff1 uuid; staff2 uuid; staff3 uuid; staff4 uuid; staff5 uuid; staff6 uuid;
  -- clients
  c_zahrani uuid; c_anwar uuid; c_birr uuid; c_justice uuid; c_saad uuid;
  c_fajr uuid;     c_dosari uuid; c_ghamdi uuid; c_mostaqbal uuid; c_anazi uuid;
  -- cases
  case1 uuid; case2 uuid; case3 uuid;
  -- guard
  has_data int;
BEGIN
  -- Skip if already seeded (looking for the well-known test client code)
  SELECT count(*) INTO has_data FROM public.clients WHERE client_code IN ('CLT-10001','CLT-10002');
  IF has_data > 0 THEN
    RAISE NOTICE 'Test data already exists, skipping seed.';
    RETURN;
  END IF;

  -- ============================================================
  -- STAFF (team members)
  -- ============================================================
  INSERT INTO public.staff (user_code, type, full_name, first_name, last_name, email, phone, id_number, nationality, status)
  VALUES ('USR-10001', 'lawyer', 'أحمد العلي', 'أحمد', 'العلي', 'ahmed.ali@office.sa', '0501234567', '1023456789', 'saudi', 'active')
  RETURNING id INTO staff1;

  INSERT INTO public.staff (user_code, type, full_name, first_name, last_name, email, phone, id_number, nationality, status)
  VALUES ('USR-10002', 'lawyer', 'سارة الأحمد', 'سارة', 'الأحمد', 'sara.ahmed@office.sa', '0509876543', '1034567890', 'saudi', 'active')
  RETURNING id INTO staff2;

  INSERT INTO public.staff (user_code, type, full_name, first_name, last_name, email, phone, id_number, nationality, status)
  VALUES ('USR-10003', 'supervisor', 'محمد القحطاني', 'محمد', 'القحطاني', 'm.qahtani@office.sa', '0551112233', '1045678901', 'saudi', 'active')
  RETURNING id INTO staff3;

  INSERT INTO public.staff (user_code, type, full_name, first_name, last_name, email, phone, id_number, nationality, status)
  VALUES ('USR-10004', 'coordinator', 'فاطمة الشمري', 'فاطمة', 'الشمري', 'f.shamri@office.sa', '0567778899', '1056789012', 'saudi', 'active')
  RETURNING id INTO staff4;

  INSERT INTO public.staff (user_code, type, full_name, first_name, last_name, email, phone, id_number, nationality, status)
  VALUES ('USR-10005', 'lawyer', 'خالد المطيري', 'خالد', 'المطيري', 'k.mutairi@office.sa', '0532223344', '1067890123', 'saudi', 'active')
  RETURNING id INTO staff5;

  INSERT INTO public.staff (user_code, type, full_name, first_name, last_name, email, phone, id_number, nationality, status)
  VALUES ('USR-10006', 'support', 'ليلى السبيعي', 'ليلى', 'السبيعي', 'l.subaie@office.sa', '0544445566', '1078901234', 'saudi', 'inactive')
  RETURNING id INTO staff6;

  -- ============================================================
  -- CLIENTS
  -- ============================================================
  INSERT INTO public.clients (client_code, client_type, contract_type, full_name, first_name, second_name, last_name, id_number, nationality, email, phone, notes, status)
  VALUES ('CLT-10001', 'individual', 'annual', 'عبدالله محمد الزهراني', 'عبدالله', 'محمد', 'الزهراني', '1112223334', 'saudi', 'a.zahrani@gmail.com', '0501122334', 'عميل قديم منذ 2024', 'active')
  RETURNING id INTO c_zahrani;

  INSERT INTO public.clients (client_code, client_type, contract_type, full_name, last_name, id_number, nationality, email, phone, notes, status)
  VALUES ('CLT-10002', 'private', 'annual', 'شركة الأنوار للمقاولات', 'شركة الأنوار للمقاولات', '7001234567', 'saudi', 'info@anwar.com.sa', '0112345678', 'سجل تجاري 1010234567', 'active')
  RETURNING id INTO c_anwar;

  INSERT INTO public.clients (client_code, client_type, contract_type, full_name, last_name, id_number, nationality, email, phone, status)
  VALUES ('CLT-10003', 'institution', 'default', 'مؤسسة البر الخيرية', 'مؤسسة البر الخيرية', '7002345678', 'saudi', 'contact@birr.org', '0114567890', 'active')
  RETURNING id INTO c_birr;

  INSERT INTO public.clients (client_code, client_type, contract_type, full_name, last_name, id_number, nationality, email, phone, notes, status)
  VALUES ('CLT-10004', 'government', 'default', 'وزارة العدل', 'وزارة العدل', '0000000001', 'saudi', 'legal@moj.gov.sa', '0114052222', 'تنسيق رسمي', 'active')
  RETURNING id INTO c_justice;

  INSERT INTO public.clients (client_code, client_type, contract_type, full_name, first_name, second_name, last_name, id_number, nationality, email, phone, status)
  VALUES ('CLT-10005', 'individual', 'single', 'منى عبدالعزيز السعد', 'منى', 'عبدالعزيز', 'السعد', '2223334445', 'saudi', 'mona.saad@email.com', '0556677889', 'active')
  RETURNING id INTO c_saad;

  INSERT INTO public.clients (client_code, client_type, contract_type, full_name, last_name, id_number, nationality, email, phone, status)
  VALUES ('CLT-10006', 'private', 'annual', 'شركة الفجر للنقل', 'شركة الفجر للنقل', '7003456789', 'saudi', 'info@fajr-transport.sa', '0125556667', 'active')
  RETURNING id INTO c_fajr;

  INSERT INTO public.clients (client_code, client_type, contract_type, full_name, first_name, last_name, id_number, nationality, phone, status)
  VALUES ('CLT-10007', 'individual', 'default', 'سعد ناصر الدوسري', 'سعد', 'الدوسري', '3334445556', 'saudi', '0533344455', 'active')
  RETURNING id INTO c_dosari;

  INSERT INTO public.clients (client_code, client_type, contract_type, full_name, first_name, last_name, id_number, nationality, email, phone, notes, status)
  VALUES ('CLT-10008', 'individual', 'single', 'هند علي الغامدي', 'هند', 'الغامدي', '4445556667', 'saudi', 'hind.ghamdi@gmail.com', '0577889900', 'استشارة أحوال شخصية', 'active')
  RETURNING id INTO c_ghamdi;

  INSERT INTO public.clients (client_code, client_type, contract_type, full_name, last_name, id_number, nationality, email, phone, status)
  VALUES ('CLT-10009', 'private', 'annual', 'شركة المستقبل التجارية', 'شركة المستقبل التجارية', '7004567890', 'saudi', 'legal@future-co.sa', '0118889990', 'active')
  RETURNING id INTO c_mostaqbal;

  INSERT INTO public.clients (client_code, client_type, contract_type, full_name, first_name, second_name, last_name, id_number, nationality, phone, status)
  VALUES ('CLT-10010', 'individual', 'default', 'بدر سعود العنزي', 'بدر', 'سعود', 'العنزي', '5556667778', 'saudi', '0511223344', 'inactive')
  RETURNING id INTO c_anazi;

  -- ============================================================
  -- CASES
  -- ============================================================
  INSERT INTO public.cases (case_code, client_id, case_type, court_type, request_title, description, urgency, priority, status, claim_type, estimated_fees, payment_status)
  VALUES ('CSE-20001', c_anwar, 'commercial', 'commercial', 'نزاع تجاري حول تسليم مشروع', 'تأخر في تسليم مشروع إنشائي للعميل وطلب تعويض', 'high', 'high', 'active', 'financial', 75000, 'partial')
  RETURNING id INTO case1;

  INSERT INTO public.cases (case_code, client_id, case_type, court_type, request_title, description, urgency, priority, status, claim_type, estimated_fees, payment_status)
  VALUES ('CSE-20002', c_zahrani, 'labor', 'labor', 'مطالبة بمستحقات نهاية الخدمة', 'فصل تعسفي والمطالبة بمكافأة نهاية الخدمة', 'normal', 'medium', 'active', 'financial', 25000, 'paid')
  RETURNING id INTO case2;

  INSERT INTO public.cases (case_code, client_id, case_type, court_type, request_title, description, urgency, priority, status)
  VALUES ('CSE-20003', c_saad, 'personal-status', 'personal-status', 'طلب طلاق للضرر', 'قضية طلاق مع حضانة', 'medium', 'medium', 'active')
  RETURNING id INTO case3;

  INSERT INTO public.cases (case_code, client_id, case_type, court_type, request_title, urgency, priority, status, estimated_fees)
  VALUES ('CSE-20004', c_mostaqbal, 'real-estate', 'general', 'نزاع عقاري حول ملكية أرض', 'normal', 'low', 'active', 50000);

  INSERT INTO public.cases (case_code, client_id, case_type, court_type, request_title, urgency, priority, status, estimated_fees)
  VALUES ('CSE-20005', c_anazi, 'criminal', 'criminal', 'دفاع في قضية شيك بدون رصيد', 'high', 'high', 'active', 15000);

  INSERT INTO public.cases (case_code, client_id, case_type, court_type, request_title, urgency, priority, status, estimated_fees)
  VALUES ('CSE-20006', c_fajr, 'execution', 'execution', 'تنفيذ حكم تجاري', 'critical', 'urgent', 'active', 30000);

  INSERT INTO public.cases (case_code, client_id, case_type, court_type, request_title, urgency, priority, status)
  VALUES ('CSE-20007', c_dosari, 'civil', 'general', 'دعوى مطالبة بدين', 'normal', 'medium', 'active');

  INSERT INTO public.cases (case_code, client_id, case_type, court_type, request_title, urgency, priority, status)
  VALUES ('CSE-20008', c_ghamdi, 'personal-status', 'personal-status', 'استشارة في قضية ميراث', 'normal', 'low', 'active');

  -- ============================================================
  -- CONTRACTS
  -- ============================================================
  INSERT INTO public.contracts (contract_code, client_id, client_full_name, client_type, title, contract_type, start_date, end_date, priority, status, services, tax_rate, installments)
  VALUES (
    'CNT-30001', c_anwar, 'شركة الأنوار للمقاولات', 'private',
    'عقد أتعاب سنوي - شركة الأنوار', 'retainer',
    '2026-01-01', '2026-12-31', 'high', 'active',
    '[{"id":"1","name":"خدمات استشارية شهرية","qty":12,"price":5000},{"id":"2","name":"تمثيل قضائي","qty":1,"price":50000}]'::jsonb,
    15,
    '[{"id":"1","date":"2026-01-15","amount":27500,"note":"الدفعة الأولى"},{"id":"2","date":"2026-07-01","amount":27500,"note":"الدفعة الثانية"}]'::jsonb
  );

  INSERT INTO public.contracts (contract_code, client_id, client_full_name, client_type, title, contract_type, start_date, end_date, priority, status, services, tax_rate)
  VALUES (
    'CNT-30002', c_birr, 'مؤسسة البر الخيرية', 'institution',
    'عقد استشاري قانوني', 'consulting',
    '2026-03-01', '2027-02-28', 'medium', 'active',
    '[{"id":"1","name":"استشارات قانونية شهرية","qty":12,"price":3000}]'::jsonb,
    15
  );

  INSERT INTO public.contracts (contract_code, client_id, client_full_name, client_type, title, contract_type, priority, status, services, tax_rate)
  VALUES (
    'CNT-30003', c_saad, 'منى عبدالعزيز السعد', 'individual',
    'عقد متابعة قضية أحوال شخصية', 'case-based',
    'medium', 'draft',
    '[{"id":"1","name":"أتعاب أساسية","qty":1,"price":20000}]'::jsonb,
    15
  );

  INSERT INTO public.contracts (contract_code, client_id, client_full_name, client_type, title, contract_type, start_date, end_date, priority, status, services, tax_rate)
  VALUES (
    'CNT-30004', c_fajr, 'شركة الفجر للنقل', 'private',
    'عقد صياغة عقود توريد', 'drafting',
    '2026-04-01', '2026-09-30', 'medium', 'active',
    '[{"id":"1","name":"صياغة عقود","qty":5,"price":4000}]'::jsonb,
    15
  );

  INSERT INTO public.contracts (contract_code, client_id, client_full_name, client_type, title, contract_type, priority, status, services, tax_rate)
  VALUES (
    'CNT-30005', c_mostaqbal, 'شركة المستقبل التجارية', 'private',
    'عقد أتعاب سنوي - المستقبل', 'retainer',
    'high', 'draft',
    '[{"id":"1","name":"خدمات قانونية شاملة","qty":12,"price":7500}]'::jsonb,
    15
  );

  -- ============================================================
  -- TASKS
  -- ============================================================
  INSERT INTO public.tasks (task_code, title, description, status, priority, due_date, case_id) VALUES
    ('TSK-40001', 'إعداد مذكرة دفاع', 'مذكرة دفاع لقضية الأنوار قبل الجلسة القادمة', 'doing', 'high', CURRENT_DATE, case1),
    ('TSK-40002', 'مراجعة عقد البيع', 'مراجعة بنود عقد بيع عقاري', 'todo', 'medium', CURRENT_DATE + INTERVAL '1 day', NULL),
    ('TSK-40003', 'حضور جلسة الأنوار', 'الجلسة الأولى في المحكمة التجارية', 'todo', 'urgent', CURRENT_DATE + INTERVAL '2 days', case1),
    ('TSK-40004', 'الاتصال بالعميل عبدالله', 'متابعة مستجدات قضية المستحقات', 'todo', 'low', NULL, case2),
    ('TSK-40005', 'تسليم وثائق المحكمة', 'وثائق قضية الإفلاس', 'doing', 'high', CURRENT_DATE - INTERVAL '2 days', NULL),
    ('TSK-40006', 'تحضير عرض تقديمي', 'عرض للعميل الجديد', 'todo', 'medium', CURRENT_DATE + INTERVAL '7 days', NULL),
    ('TSK-40007', 'مراجعة المستحقات المالية', 'مراجعة فواتير الشهر', 'review', 'medium', CURRENT_DATE + INTERVAL '3 days', NULL),
    ('TSK-40008', 'كتابة عقد جديد', 'صياغة عقد توريد لشركة الفجر', 'doing', 'low', CURRENT_DATE + INTERVAL '5 days', NULL),
    ('TSK-40009', 'إرسال إشعار قانوني', 'إنذار عدلي للطرف الآخر', 'done', 'urgent', CURRENT_DATE - INTERVAL '1 day', NULL),
    ('TSK-40010', 'تنظيم ملفات الأرشيف', 'ترتيب الملفات السنوية', 'doing', 'low', NULL, NULL),
    ('TSK-40011', 'اجتماع فريق العمل', 'الاجتماع الأسبوعي للفريق', 'done', 'medium', CURRENT_DATE - INTERVAL '3 days', NULL),
    ('TSK-40012', 'تحديث بيانات العملاء', 'مراجعة بيانات العملاء في النظام', 'todo', 'low', CURRENT_DATE + INTERVAL '10 days', NULL),
    ('TSK-40013', 'إعداد تقرير شهري', 'تقرير الأداء للإدارة', 'review', 'medium', CURRENT_DATE + INTERVAL '4 days', NULL),
    ('TSK-40014', 'مراجعة الفاتورة الضريبية', 'فحص فواتير ضريبة القيمة المضافة', 'todo', 'high', CURRENT_DATE + INTERVAL '1 day', NULL),
    ('TSK-40015', 'الرد على استشارة هند', 'استشارة قضية الميراث', 'doing', 'medium', CURRENT_DATE + INTERVAL '2 days', NULL),
    ('TSK-40016', 'إعداد عريضة الدعوى', 'دعوى مطالبة بدين للدوسري', 'todo', 'high', CURRENT_DATE + INTERVAL '5 days', NULL),
    ('TSK-40017', 'متابعة تنفيذ حكم', 'حكم تنفيذي لشركة الفجر', 'doing', 'urgent', CURRENT_DATE, NULL),
    ('TSK-40018', 'تجديد التراخيص', 'تجديد رخصة المكتب', 'todo', 'medium', CURRENT_DATE + INTERVAL '30 days', NULL);

  RAISE NOTICE 'Seed data inserted successfully!';
  RAISE NOTICE '- 6 staff members';
  RAISE NOTICE '- 10 clients';
  RAISE NOTICE '- 8 cases';
  RAISE NOTICE '- 5 contracts';
  RAISE NOTICE '- 18 tasks';
END $$;
