# CampusTech

**Lost something? Found something? Post it here.**

CampusTech is a minimal, mobile-first lost-and-found board for college communities. Students sign in with Google through Supabase Auth, post lost or found items, browse recent posts, and manage their own posts.

## Stack

- Plain HTML, CSS, and vanilla JavaScript ES modules
- Supabase Auth with Google OAuth
- Supabase Postgres with Row Level Security
- Firebase Hosting for the static frontend (optional; any static host works)
- No file storage: images use an optional URL or client-side JPEG compression stored in Postgres under the 100 KB limit

## Supabase setup

The app is connected to the Supabase project configured in `js/supabase-config.js`.

1. In the Supabase Dashboard, open **Authentication → Providers → Google** and enable Google OAuth.
2. Create Google OAuth credentials in Google Cloud Console. Add the Supabase callback URL shown in the provider settings as an authorized redirect URI.
3. Under **Authentication → URL Configuration**, add your local URL (for example `http://localhost:8000`) and deployed site URL to the redirect allow list.
4. Change `ALLOWED_EMAIL_DOMAIN` in `js/supabase-config.js` from `yourcollege.edu` to your college domain. The app rejects accounts outside this domain after OAuth sign-in.
5. The `items` table and RLS policies are already applied to the connected project. The reproducible SQL is in [`supabase/schema.sql`](supabase/schema.sql).

> The URL and publishable key in `js/supabase-config.js` are browser-safe. Database access is protected by Supabase Row Level Security; never put a service-role key in the frontend.

## Run locally

Because ES modules are loaded by the browser, serve the folder over HTTP instead of opening `index.html` directly:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy the frontend

Firebase Hosting is retained only as a static hosting option:

```bash
npm install -g firebase-tools
firebase login
firebase use --add
firebase deploy --only hosting
```

You can also deploy the repository to another static host. Add that site URL to Supabase Auth's redirect allow list.

## Database model

Table: `public.items`

```text
type, title, description, category, location, date, contact,
image_data, user_id, user_name, status (open | resolved), created_at
```

Authenticated users can read and create posts. Only the owner can update or delete a post. RLS and database checks validate ownership, field names, types, and string sizes. The UI reads 20 posts at a time and provides **Load more** for additional results.

## MVP notes

- Search matches titles on the currently loaded posts.
- Filters match Lost/Found and the listed category values.
- Owners can mark their own open posts resolved or delete them.
- No admin dashboard, chat, notifications, analytics, or file storage is included.
