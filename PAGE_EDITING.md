# Editing public pages

Admins (the existing `e-board` role) can open `/about` or `/membership`, choose
**Edit page**, edit content in place, and choose **Save changes** or **Cancel**.
Saved content is public. About Us supports formatted text and links. Membership
supports titles, requirement lists, the application button/link, and the footnote.
The existing About Us image and video are unchanged.

## Deploying

1. In the **backend** repository, apply `sql/tables/page_content.sql` to the intended
   Supabase project. It adds one table and RLS policies using the existing
   `public.is_eboard(auth.email())` function. It does not modify existing content.
2. Deploy the backend with the new `/page-content/:slug` routes.
3. Deploy the frontend with its existing production environment variables.

The migration has not been applied automatically. Until it is applied and the
backend routes are available, visitors still see the original content and the
admin editor shows a load error with Retry. A missing row is different from a
failed request: an empty table allows the first admin save to create each page.

The frontend uses its existing TinyMCE key (`VITE_TINY_MCE_KEY`) for the About Us
editor. The application URL override applies to the Membership page. Leaving it
blank uses the existing `links` table's `forms` entry.

## Persistence and permissions

- GET is public; PUT requires the existing JWT verification and e-board middleware.
- Each save uses a request-scoped Supabase client with the user's token. Database
  RLS independently permits writes only for e-board accounts.
- The backend validates content, strips unsafe HTML and links, and rejects stale
  versions with HTTP 409. Failed saves retain the editor's draft.
- Reads are not cached. Existing page copy provides the initial content before
  any admin has saved a page, and remains the fallback during API outages.

## Verification

Backend: `npm test -- --runInBand pageContent.test.ts`.
This suite verifies real signed JWTs, authorization, validation, sanitization,
save/read behavior, and concurrent edits with an isolated in-memory database double.

Frontend: `npm run build`.
With Vite running and Playwright available, run
`node tests/pageEditing.browser.cjs` from `Frontend`. Set `PLAYWRIGHT_MODULE` and
`CHROMIUM_PATH` if using a separately installed Playwright runtime/browser.
This browser suite mocks authentication and page-content requests; it never writes
to Supabase. It checks public/member visibility, admin edits, save/reload, Cancel,
failed-save draft retention, concurrent-edit conflicts, rich text, and mobile layout.

The live Supabase save/reload check must be performed after applying the migration
and logging in with an e-board account in the intended environment.
