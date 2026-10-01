# CampusTech

**Lost something? Found something? Post it here.**

CampusTech is a minimal, mobile-first lost-and-found board for college communities. Anyone with a Google account can sign in through Supabase Auth, post lost or found items, browse recent posts, and manage returns.

## Who should use CampusTech

- **Students and campus staff** who need a simple way to report lost or found items.
- **Campus clubs, departments, or admins** who want to host a shared lost-and-found board.
- **Developers/maintainers** who need a static, low-ops app that can be deployed quickly.

## Quick start for first-time setup

1. Clone this repository.
2. Create a Supabase project.
3. Run [`supabase/schema.sql`](supabase/schema.sql) in Supabase SQL Editor.
4. Configure Google OAuth in Google Cloud and Supabase (see full steps below).
5. Update `js/supabase-config.js` with your Supabase project URL and publishable key.
6. Run the app locally:

   ```bash
   python3 -m http.server 8000
   ```

7. Open `http://localhost:8000`, sign in with Google, and test posting items.

## Stack

- Plain HTML, CSS, and vanilla JavaScript ES modules
- Supabase Auth with Google OAuth
- Supabase Postgres with Row Level Security
- Supabase Storage for optional public item images
- Pinned `supabase-js` loaded from jsDelivr
- Static hosting only; no server code, paid features, Edge Functions, or Realtime

## Enable Google login — complete step-by-step setup

The app is already coded to call Supabase Google OAuth. You must configure Google and Supabase once before the **Sign in with Google** button can work.

### Part 1: Create or select a Google Cloud project

1. Open [Google Auth Platform](https://console.cloud.google.com/auth/overview).
2. Sign in with the Google account that manages this app.
3. Select an existing Google Cloud project, or click **Create project** and create one for CampusTech.
4. If Google asks you to register the app, complete the registration.
5. Open **Google Auth Platform → Branding**.
6. Enter an app name such as `CampusTech`.
7. Select a support email and add a developer contact email.
8. Save the branding settings.

### Part 2: Make the Google app available to everyone

1. Open **Google Auth Platform → Audience**.
2. Set the app audience to **External**. This allows Google accounts outside your organization to sign in.
3. If the app is in **Testing** mode, add your own Google account under **Test users** so you can test immediately.
4. Testing mode may limit who can sign in and may show a testing warning. To allow broad public use, publish the app when Google presents that option.
5. Only request the basic identity scopes needed for login: `openid`, email, and profile. Do not request extra Google API scopes for this MVP.

### Part 3: Create the Google OAuth Web client

1. Open **Google Auth Platform → Clients**.
2. Click **Create client**.
3. Select application type **Web application**.
4. Give it a name such as `CampusTech Web`.
5. Under **Authorized JavaScript origins**, add the origins where CampusTech will run. Add each one separately:
   - `http://localhost:8000` for local testing with the README command
   - `http://127.0.0.1:8000` if you sometimes use that address
   - Your production origin, for example `https://campustech.example.com`
6. Do **not** add a path such as `/index.html` to an origin. Use only scheme plus host and port.
7. Under **Authorized redirect URIs**, add the Supabase callback URL for this project:

   ```text
   https://fcubaxsmyfaokfdvcxsj.supabase.co/auth/v1/callback
   ```

8. Click **Create**.
9. Copy the **Client ID** and **Client Secret**. Keep the secret private; do not put it in this repository or in frontend JavaScript.

### Part 4: Enable Google inside Supabase

1. Open the [Supabase Dashboard](https://supabase.com/dashboard/project/fcubaxsmyfaokfdvcxsj).
2. Select the CampusTech project.
3. Go to **Authentication → Providers → Google**.
4. Turn on **Google Enabled**.
5. Paste the Google OAuth **Client ID**.
6. Paste the Google OAuth **Client Secret**.
7. Confirm that the provider callback URL shown by Supabase exactly matches the redirect URI added in Google Cloud.
8. Click **Save**.

### Part 5: Configure Supabase redirect URLs

1. In Supabase, go to **Authentication → URL Configuration**.
2. Set **Site URL** to the real deployed origin, for example:

   ```text
   https://campustech.example.com
   ```

3. Under **Additional Redirect URLs**, add the local development URLs you will use:

   ```text
   http://localhost:8000
   http://127.0.0.1:8000
   ```

4. Add the production origin too if it differs from Site URL.
5. Click **Save**.

The app passes `window.location.origin` as `redirectTo`, so the exact origin you open in the browser must be present in this allow list. Do not add a trailing path unless the app is actually hosted at that path.

### Part 6: Confirm the database and Storage setup

The connected Supabase project already has these resources:

- `public.profiles` with RLS enabled
- `public.items` with RLS enabled
- `public.returns` with RLS enabled
- Public Storage bucket `item-images`

For a new Supabase project, open **SQL Editor**, paste [`supabase/schema.sql`](supabase/schema.sql), and click **Run**. The schema creates the tables, signup profile trigger, return-status trigger, RLS policies, Storage bucket, and Storage policies.

There is **no college-domain restriction anymore**. The database and frontend allow any Google account accepted by the Google OAuth provider.

### Part 7: Run and test locally

1. From the repository root, start a static server:

   ```bash
   python3 -m http.server 8000
   ```

2. Open exactly `http://localhost:8000` in your browser.
3. Click **Sign in with Google**.
4. Choose a Google account. The first sign-in may show Google's consent screen.
5. Approve the basic profile permissions.
6. Confirm that you return to CampusTech and see your account in the header.
7. Create a test lost or found post.
8. Test an optional image upload.
9. Use the owner controls to mark the item returned, enter return details, and confirm the Returned badge.
10. Sign out and sign in with another Google account to confirm that other users see the Returned badge but not the private return details.

### Common errors

- **`redirect_uri_mismatch` in Google:** the Supabase callback URL was not added exactly under the Google OAuth client's **Authorized redirect URIs**.
- **`Unsupported provider` or provider disabled:** Google is not enabled or saved under Supabase **Authentication → Providers → Google**.
- **Redirect URL not allowed:** the browser origin is missing from Supabase **Authentication → URL Configuration → Additional Redirect URLs**.
- **Testing app blocks the account:** add the account under Google Auth Platform **Audience → Test users**, or publish the app for public use.
- **Wrong account appears:** sign out of Google in the browser or use an incognito window, then try again.
- **Image upload fails:** confirm the public `item-images` bucket and Storage policies were created by `supabase/schema.sql`.

## Deploy

Deploy the repository as a static site. Firebase Hosting remains an optional hosting choice:

```bash
npm install -g firebase-tools
firebase login
firebase use --add
firebase deploy --only hosting
```

After deployment, add the exact deployed origin to both Google Cloud **Authorized JavaScript origins** and Supabase **Additional Redirect URLs**, and use it as the Supabase **Site URL**.

You can also use any static host; no server code is required.

## Database model

- `profiles`: one profile created automatically for each Auth user
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

## Official references

- [Supabase: Sign in with Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Supabase: Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
- [Google Cloud: Manage OAuth clients](https://support.google.com/cloud/answer/15549257)

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
