# FinancePlan - English Version

This is the English version of the FinancePlan application, designed to be deployed on a separate domain for different geographical regions.

## Features

- Complete English translation of all UI components
- All user-facing text translated from Russian to English
- Same database as the Russian version (supports multi-language deployments)
- Identical functionality and features

## Deployment Instructions

### 1. Database Configuration

The English version uses the **same Supabase database** as the Russian version. This means:
- All tables, schemas, and data are shared
- Users from both versions can be managed in one database
- No need to run migrations again

Make sure your `.env` file has the correct Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 2. Edge Functions

The current Edge Functions (in the main project) are in Russian. You have two options:

**Option A: Use Shared Functions (Recommended)**
- Keep using the existing Edge Functions from the main project
- They work with the same database and will function correctly
- No additional setup needed

**Option B: Create Separate English Functions**
- Create English versions of Edge Functions with translated messages
- Deploy them with different names (e.g., `analyze-finances-en`, `notify-new-registration-en`)
- Update the frontend API calls to use the new function names

### 3. Build and Deploy

```bash
cd english-version
npm install
npm run build
```

Deploy the `dist` folder to your hosting provider (Vercel, Netlify, etc.).

### 4. Domain Setup

Point your English domain to this deployment. For example:
- Russian version: `financeplan.ru`
- English version: `financeplan.com` or `en.financeplan.ru`

## Key Differences from Russian Version

- All UI text is in English
- Date formatting uses 'en-GB' locale instead of 'ru-RU'
- Currency symbols and number formatting adjusted for English-speaking users
- Pluralization rules adapted for English grammar

## File Structure

```
english-version/
├── src/
│   ├── components/     # All components translated to English
│   ├── hooks/          # Shared hooks (no translation needed)
│   ├── lib/            # Shared utilities (no translation needed)
│   └── App.tsx         # Main app component
├── public/             # Static assets
└── ...config files
```

## Notes

- The project structure is identical to the Russian version
- All code logic remains the same, only user-facing text is translated
- Both versions can run simultaneously on different domains
- Users from both versions are stored in the same database
