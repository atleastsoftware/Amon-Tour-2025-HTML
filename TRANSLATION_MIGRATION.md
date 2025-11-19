# Translation System Migration Guide

## Overview

The translation system has been updated to prevent different blocks from overwriting each other's translations. Each block instance now has its own unique translation section (e.g., `text_435`, `hero_199`) instead of sharing a common section by block type.

## Migration Required

All existing blocks need to have their translations generated. This is a one-time migration that will:
1. Read all existing blocks from the database
2. Generate French and Spanish translations for each block
3. Save translations to JSON files with block-specific sections

## How to Run the Migration

### Option 1: Using Browser Console (Recommended)

1. Log in to the Admin Dashboard (`/admin-login`)
2. Open browser console (F12 or Cmd+Option+I on Mac)
3. Run the following command:

```javascript
fetch('/api/admin/migrate-block-translations', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' }
})
.then(r => r.json())
.then(data => console.log('✅ Migration completed:', data))
.catch(err => console.error('❌ Migration failed:', err));
```

### Option 2: Using cURL

```bash
# First, login to get session cookie
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_password"}' \
  -c cookies.txt

# Then run migration
curl -X POST http://localhost:5000/api/admin/migrate-block-translations \
  -b cookies.txt \
  -H "Content-Type: application/json"
```

## What Happens During Migration

The migration will:
- Process all blocks in the database (approximately 9 blocks)
- For each block, translate all text fields to French and Spanish
- Skip blocks with no translatable content
- Update the JSON translation files (`en.json`, `fr.json`, `es.json`)

## Important Notes

### API Rate Limits
- The system uses MyMemory API (free tier: 100 translations/day)
- Each block may require 2-10 translation requests depending on its fields
- If you hit the limit, wait 24 hours and run again

### Translation Sections
After migration, your translation files will have sections like:
```json
{
  "text_435": {
    "description": "...",
    "title": "..."
  },
  "hero_199": {
    "title": "...",
    "subtitle": "..."
  }
}
```

## Verification

After migration, verify that:
1. All blocks show proper translations when you switch languages on the public site
2. Translation files have been updated with block-specific sections
3. No translation sections are being overwritten by different blocks

## Troubleshooting

### Migration fails with "Authentication required"
- Make sure you're logged in as admin before running the command
- Session cookies must be included in the request

### Some blocks don't have translations
- Run the migration again - it will only translate blocks that need it
- Check server logs for specific error messages

### Translations are not appearing on the public site
- Clear browser cache
- Verify translation files were updated in `client/src/locales/`
- Check browser console for any errors

## Support

For issues or questions, check the server logs in the Replit console for detailed error messages.
