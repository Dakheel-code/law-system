# شركة ناصر طريد للمحاماة — نظام إدارة المكتب

نظام شامل لإدارة مكاتب المحاماة بُني بـ React + TypeScript + Tailwind + Supabase.

## المميزات

- **لوحة تحكم** مع KPIs ورسوم بيانية
- **العملاء** — قائمة + إضافة/تعديل
- **القضايا** — نموذج 6 خطوات + قائمة فرعية
- **الاستشارات** — نموذج 4 خطوات
- **التعاقدات** — نموذج 6 خطوات (مع جدول مدفوعات وضرائب)
- **المواعيد + التقويم** بتاريخ هجري وميلادي
- **المهام** بأسلوب Kanban
- **التقارير والإحصائيات**
- **المالية** + **الموارد البشرية** بقوائم متعددة المستويات
- **إدارة المستخدمين والصلاحيات** بـ 40 صلاحية موزّعة على 7 مجموعات
- **مصادقة Supabase** بالبريد وكلمة المرور

## المتطلبات

- Node.js 18+
- حساب Supabase

## الإعداد

```bash
# تثبيت الحزم
npm install

# نسخ ملف المتغيرات
cp .env.example .env.local
```

عدّل `.env.local` وأضف:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

احصل على القيم من **Supabase Dashboard → Settings → API**.

## التشغيل

```bash
npm run dev      # بيئة التطوير
npm run build    # بناء الإنتاج
npm run preview  # معاينة الإنتاج
```

## التقنيات

- **Vite + React 19 + TypeScript**
- **Tailwind CSS v3** — RTL + خط Tajawal
- **React Router 7**
- **Recharts** — للرسوم البيانية
- **Lucide React** — للأيقونات
- **Supabase** — للمصادقة وقاعدة البيانات

## الهيكل

```
src/
├── components/      # المكوّنات القابلة لإعادة الاستخدام
├── config/          # القوائم والخيارات القابلة للتخصيص
├── context/         # AuthContext
├── lib/             # supabase, hijri
├── pages/           # صفحات التطبيق
└── App.tsx          # المسارات
```

## ملاحظات

- التصميم RTL بالكامل
- التواريخ تدعم الهجري (Umm al-Qura) والميلادي
- الصلاحيات والأدوار قابلة للتخصيص من `src/config/userConfig.ts`
- أنواع القضايا والمحاكم قابلة للتخصيص من `src/config/caseConfig.ts`
