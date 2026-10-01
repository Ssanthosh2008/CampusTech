# CampusTech

**Lost something? Found something? Post it here.**

CampusTech is a minimal, mobile-first lost-and-found board for college communities. Students sign in with Google, post lost or found items, browse recent posts, and manage their own posts.

## Stack

- Plain HTML, CSS, and vanilla JavaScript ES modules
- Firebase Authentication (Google provider)
- Cloud Firestore
- Firebase Hosting
- No Firebase Storage: images use an optional URL or client-side JPEG compression stored in Firestore under the 100 KB limit

## Firebase setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
2. Create a Firestore database in production mode.
3. Enable **Authentication → Sign-in method → Google**.
4. Add your deployed Hosting domain (and `localhost` for local testing) under **Authentication → Settings → Authorized domains**.
5. Open **Project settings → Your apps**, register a Web app, and copy its config.
6. Replace the placeholder values in `js/firebase-config.js` with that config.
7. Change `ALLOWED_EMAIL_DOMAIN` in the same file from `yourcollege.edu` to your college domain. The app rejects accounts outside this domain after Google sign-in.

> Keep `js/firebase-config.js` free of service-account credentials. Firebase web config values are client-side identifiers; Firestore rules are the security boundary.

## Run locally

Because ES modules are loaded by the browser, serve the folder over HTTP instead of opening `index.html` directly:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy

Install the Firebase CLI if needed, then authenticate and select your project:

```bash
npm install -g firebase-tools
firebase login
firebase use --add
firebase deploy --only firestore:rules,hosting
```

The included `firebase.json` publishes the repository root as Firebase Hosting content. Do not deploy until you have replaced the config placeholders and college domain.

## Firestore data model

Collection: `items`

```text
type, title, description, category, location, date, contact,
imageData, userId, userName, status (open | resolved), createdAt
```

Signed-in users can read and create posts. Only the owner can update or delete a post. Rules validate field names, types, and string sizes. The UI reads 20 posts at a time and provides **Load more** for additional results.

## MVP notes

- Search matches titles on the currently loaded posts.
- Filters match Lost/Found and the listed category values.
- Owners can mark their own open posts resolved or delete them.
- No admin dashboard, chat, notifications, analytics, or Firebase Storage is included.
