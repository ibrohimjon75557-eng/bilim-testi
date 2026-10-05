# BilimTest Pro — Onlayn Ta’lim va Test Platformasi

Zamonaviy, tezkor, xavfsiz va mobil qurilmalarga to‘liq moslashgan (Mobile-First + PWA) o‘zbek tilidagi onlayn test va ta’lim platformasi.

---

## 1. Supabase loyihasini yaratish
1. [https://supabase.com](https://supabase.com) saytiga kiring va yangi loyiha (`New Project`) yarating.
2. Loyiha nomi sifatida `bilimtest-pro` va kuchli database parolini kiriting.
3. Region sifatida foydalanuvchilarga yaqin hududni (masalan, `Frankfurt` yoki `Singapore`) tanlang.

## 2. Database Migration va RLS siyosatlarini ishga tushirish
1. Supabase Dashboard ichida **SQL Editor** bo‘limiga o‘ting.
2. Loyihadagi `supabase/migrations/001_initial_schema.sql` faylining to‘liq matnini nusxalab oling.
3. SQL Editor oynasiga joylashtiring va **Run** tugmasini bosing.
4. Bu skript barcha 13 ta jadvalni (`users`, `groups`, `group_members`, `books`, `topics`, `tests`, `questions`, `answers`, `test_groups`, `attempts`, `attempt_answers`, `telegram_codes`, `audit_logs`), yuqori tezlik uchun indekslarni hamda **Row Level Security (RLS)** qoidalarini avtomatik yaratadi.

## 3. Environment Variables (.env) sozlash
Loyiha ildizida `.env` faylini yarating (`.env.example` asosida):

```env
SUPABASE_URL="https://sizning-project-id.supabase.co"
SUPABASE_ANON_KEY="sizning-anon-key"
SUPABASE_SERVICE_ROLE_KEY="sizning-service-role-key"

TELEGRAM_BOT_TOKEN="1234567890:AAH_bot_token"
TEACHER_TELEGRAM_CHAT_ID="987654321"
TELEGRAM_BOT_USERNAME="BilimTestProBot"

SESSION_SECRET="maxfiy-kriptografik-kalit-32-belgi"
APP_URL="https://sizning-domeningiz.uz"
```
> **Xavfsizlik eslatmasi:** `SUPABASE_SERVICE_ROLE_KEY` va `TELEGRAM_BOT_TOKEN` faqatgina `server.ts` (backend) ichida ishlatiladi va hech qachon frontend bundlega uzatilmaydi.

## 4. Telegram Bot yaratish
1. Telegramda [@BotFather](https://t.me/BotFather) botiga kiring va `/newbot` buyrug‘ini yuboring.
2. Botga nom va `@username` bering.
3. BotFather bergan HTTP API tokenni `.env` ichidagi `TELEGRAM_BOT_TOKEN` ga yozing.

## 5. Telegram Token va O‘qituvchi Chat ID sini sozlash
1. Yaratgan botingizga kirib `/start` tugmasini bosing.
2. O‘zingizning Telegram ID raqamingizni bilish uchun [@userinfobot](https://t.me/userinfobot) ga `/start` yuboring yoki platformaning **Admin -> Telegram** bo‘limidagi loglardan ko‘rib oling.
3. Olingan ID raqamni `TEACHER_TELEGRAM_CHAT_ID` o‘zgaruvchisiga yozing.

## 6. Admin akkaunt yaratish
1. Saytning `/login` sahifasidan o‘z telefon raqamingiz bilan ro‘yxatdan o‘ting va Telegram kod orqali tasdiqlang.
2. Supabase **Table Editor -> users** jadvalida o‘z qatoringizning `role` ustunini `admin` ga o‘zgartiring:
   ```sql
   UPDATE public.users SET role = 'admin' WHERE phone = '+998 90 123 45 67';
   ```
3. Preview/Demo rejimida tizimda tayyor Admin va O‘quvchi hisoblari mavjud bo‘lib, ularni 1-klik orqali sinab ko‘rishingiz mumkin.

## 7. Guruh yaratish va o‘quvchi biriktirish
1. Admin panelda **Guruhlar** (`/admin/groups`) bo‘limiga o‘ting.
2. **Guruh yaratish** tugmasini bosib, guruh nomi (masalan: `9-A Ingliz tili`) va tavsifini kiriting.
3. Guruh ichiga kirib, ro‘yxatdan o‘tgan o‘quvchilarni guruhga qo‘shing.

## 8. Kitob va Mavzular yaratish
1. **Kitoblar** (`/admin/books`) bo‘limida yangi o‘quv qo‘llanma (masalan, `English Grammar in Use`) yarating.
2. **Mavzular** (`/admin/topics`) bo‘limida ushbu kitobga tegishli mavzularni (`Present Simple`, `Modal Verbs` va h.k.) qo‘shing.

## 9. Test yaratish va Word (.docx) fayldan savol import qilish
1. **Testlar** (`/admin/tests`) bo‘limida **Yangi test** tugmasini bosing.
2. Vaqt limiti, urinishlar soni, o‘tish foizi, ochilish/yopilish sanalari, savollar va variantlarni aralashtirish hamda guruhlarni belgilang.
3. Test savollarini bittalab qo‘shishingiz yoki **Word (.docx) fayldan import** qilishingiz mumkin:
   ```text
   1. He ___ to school every day.
   A) go
   *B) goes
   C) going
   D) gone

   2. Water boils at 100 degrees Celsius.
   *A) TO'G'RI
   B) NOTO'G'RI
   ```
4. Import qilingan savollar darhol bazaga yozilmaydi — avval **Importni tekshirish** oynasida barcha xatoliklar (to‘g‘ri javob yo‘qligi, bir nechta to‘g‘ri javob, bo‘sh savol) tekshiriladi va **Saqlash** bosilganda bazaga yoziladi.

## 10. Testni guruhga biriktirish
Test yaratish yoki tahrirlash oynasida qaysi guruh o‘quvchilari ushbu testni ko‘ra olishini belgilang. O‘quvchi faqat o‘z guruhiga biriktirilgan testlarnigina ko‘ra oladi.

## 11. Natijalarni ko‘rish va boshqarish
1. **Natijalar** (`/admin/results`) sahifasida guruh, test, o‘quvchi va sana bo‘yicha filtrlash mumkin.
2. Har bir urinishning batafsil javoblari, sarflangan vaqti va **oynadan chiqishlar (tab switch)** sonini ko‘rish, natijani o‘chirish yoki qayta topshirishga ruxsat berish mumkin.
3. Shuningdek, **Testni hali ishlamagan o‘quvchilar** ro‘yxati ham mavjud.

## 12. Excel (.xlsx) eksport
**Natijalar** sahifasidagi **Excelga yuklab olish** tugmasi orqali joriy filtrlangan natijalarni to‘liq formatlangan `.xlsx` jadvali ko‘rinishida yuklab olishingiz mumkin.

## 13. Deploy qilish (Cloud Run / Render / Railway / VPS)
1. Loyihani yig‘ish:
   ```bash
   npm install
   npm run build
   ```
2. Production rejimda ishga tushirish:
   ```bash
   npm start
   ```

## 14. 500-User Load Testni ishga tushirish
Tashqi load-testing muhitida [k6](https://k6.io/) o‘rnatilgan terminal orqali quyidagi buyruqni ishga tushiring:
```bash
k6 run -e BASE_URL=https://sizning-saytingiz.run.app load-tests/k6-500-users.js
```
Shuningdek, Admin panelning **Sozlamalar / Load Test** bo‘limida serverning real parallel so‘rovlarga javob berish tezligini (Avg, P95, P99 latency) jonli sinovdan o‘tkazishingiz mumkin.
