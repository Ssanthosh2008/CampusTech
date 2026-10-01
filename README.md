# CampusTech

**Lost something? Found something? Post it here.**

CampusTech is a minimal, mobile-first lost-and-found board for college communities. Students sign in with Google through Supabase Auth, post lost or found items, browse recent posts, and manage returns.

## Stack

- Plain HTML, CSS, and vanilla JavaScript ES modules
- Supabase Auth with Google OAuth
- Supabase Postgres with Row Level Security
- Supabase Storage for optional public item images
- Pinned `supabase-js` loaded from jsDelivr
- Static hosting only; no server code, paid features, Edge Functions, or Realtime

## Supabase setup

The app is connected to the Supabase project configured in `js/supabase-config.js`. The public URL and publishable/anon key are safe to use in browser code because RLS protects the data. Never use a service-role key in the frontend.

1. Open **Supabase Dashboard → Authentication → Providers → Google** and enable Google OAuth.
2. Create Google OAuth credentials in Google Cloud Console. Add the Supabase callback URL shown in the provider settings as an authorized redirect URI.
3. Under **Authentication → URL Configuration**, add your local URL (for example `http://localhost:8000`) and deployed site URL to the redirect allow list.
4. In both `supabase/schema.sql` and `js/supabase-config.js`, replace `yourcollege.edu` with the real college domain. The database trigger rejects new Auth users outside that domain; the client check provides a friendly message too.
5. Run `supabase/schema.sql` in **SQL Editor** if setting up a new project. It creates `profiles`, `items`, and `returns`, enables RLS, installs the signup/domain/returned-status triggers, creates the `item-images` public bucket, and adds Storage policies.
6. If using the already-connected project, the migration has been applied and `public.items`, `public.profiles`, `public.returns`, and the `item-images` bucket are ready.

## Run locally

Because ES modules are loaded by the browser, serve the folder over HTTP instead of opening `index.html` directly:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy

Deploy the repository as a static site. Firebase Hosting remains an optional hosting choice:

```bash
npm install -g firebase-tools
firebase login
firebase use --add
firebase deploy --only hosting
```

You can also use any static host. Add its URL to Supabase Auth's redirect allow list.

## Database model

- `profiles`: one profile created automatically for each accepted Auth user
- `items`: lost/found posts with `status` of `open` or `returned`
- `returns`: one owner-recorded return detail per item; an insert automatically marks the item returned

Authenticated users can browse items. Users can create their own items; owners can delete posts and add return records. Other users see only the **Returned** badge, while the owner sees the recorded return details.

## Image handling

Images are optional. A selected image is resized and JPEG-compressed in the browser under 150 KB, uploaded to the public Supabase Storage bucket `item-images` under the signed-in user's folder, and only its public URL is saved in `items.image_url`. An image URL may be entered instead.

## MVP notes

- Search matches titles on the currently loaded posts.
- Filters cover Lost/Found, category, and Open/Returned status.
- Results load 20 items at a time with **Load more**.
- No admin dashboard, chat, notifications, analytics, Realtime, or server code is included.
