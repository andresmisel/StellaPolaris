# Firestore Security Specification & Red Team Audit — Stella Polaris

## 1. Data Invariants
1. **Default-Deny Baseline**: Every path not explicitly matched is denied (`match /{document=**} { allow read, write: if false; }`).
2. **Verified Admin Boundary**: Only Firebase-authenticated users with `email_verified == true` AND (`email == 'andresmisel@gmail.com'` or an existing `/admins/{uid}` document) pass `isAdmin()`.
3. **Public Content Integrity**: Public visitors can read site copy (`site_settings`), images (`site_images`), tasting ritual (`site_ritual`), archive (`site_past_edition`), second-life guide (`site_second_life`), and tabletop game cards (`game_questions`), but only `isAdmin()` can create, update, or delete them.
4. **Bottle Collector Privacy & Token Immutability**:
   - Public visitors may read a single bottle document (`allow get`) by exact ID (`01`..`50`), NEVER enumerate the collection (`allow list: if isAdmin();`).
   - Non-admin bottle updates (`Personalizar Certificado`) can modify ONLY `['ownerName', 'location', 'dedication', 'claimDate', 'claimed']` while enforcing immutability of `number`, `formattedNumber`, `code`, `authToken`, and `tokenRegenerated`.
5. **Wishes Moderation & Anti-Spam**:
   - `allow list` on `/wishes` requires `resource.data.approved == true || isAdmin()`, preventing pending/unmoderated wishes from leaking to public clients.
   - Public wish creation must set `approved == false`, `pinned == false` (or absent), `likes == 1`, and `id == wishId`.
   - Public wish update can only increment `likes` by `+1` on an already approved wish (`affectedKeys().hasOnly(['likes'])`).

## 2. Adversarial "Dirty Dozen" Payloads (Expected: `PERMISSION_DENIED`)
1. **Shadow/Ghost Field on Settings**: `setDoc('/site_settings/main', { ...validSettings, isAdminOverride: true })` -> Denied by `hasOnly(...)`.
2. **Unverified Admin Email Spoof**: Request with `auth.token.email == 'andresmisel@gmail.com'` and `auth.token.email_verified == false` -> Denied by `isVerified()`.
3. **Public Bottle Collection Scrape**: `getDocs(collection(db, 'bottles'))` without admin auth -> Denied by `allow list: if isAdmin()`.
4. **Token Tampering by Collector**: Public `updateDoc('/bottles/07', { authToken: 'HACKED' })` -> Denied by `affectedKeys().hasOnly(...)` and `incoming().authToken == existing().authToken`.
5. **Auto-Approving Own Wish**: Public `setDoc('/wishes/w-99', { ...validWish, approved: true })` -> Denied by `incoming().approved == false`.
6. **Pinning Own Wish**: Public `setDoc('/wishes/w-99', { ...validWish, approved: false, pinned: true })` -> Denied by `!incoming().keys().hasAny(['pinned']) || incoming().pinned == false`.
7. **Unmoderated Wish Scrape**: Public `getDocs(collection(db, 'wishes'))` without `where('approved', '==', true)` -> Denied by `allow list: if existing().approved == true || isAdmin()`.
8. **Inflated Wish Likes**: Public `updateDoc('/wishes/w-1', { likes: 9999 })` -> Denied by `incoming().likes == existing().likes + 1`.
9. **ID Poisoning**: Write to `/wishes/../../../evil` or 500-char ID -> Denied by `isValidId()`.
10. **Denial-of-Wallet Oversized String**: Public wish with 50KB `message` -> Denied by `data.message.size() <= 1000`.
11. **Oversized Image Injection by Non-Admin**: Unauthenticated write to `/site_images/heroBottle` -> Denied by `isAdmin()`.
12. **Self-Assigned Admin Privilege**: Authenticated non-admin `setDoc('/admins/<uid>', { email: 'user@x.com', role: 'admin' })` -> Denied by `isAdmin()`.

## 3. Red Team Audit Summary
- **Identity Spoofing**: Checked (`email_verified == true` + exact email or `/admins/{uid}` lookup). Pass.
- **Shadow Updates**: Checked (`hasAll` + `hasOnly` + `affectedKeys().hasOnly()`). Pass.
- **PII Blanket Reads**: Checked (`bottles` list restricted to `isAdmin()`; `admins` restricted to self/admin). Pass.
- **Query Trust**: Checked (`wishes` list enforces `existing().approved == true || isAdmin()`). Pass.
- **Value Poisoning**: Checked (every update validates `isValid[Entity](incoming())` and enforces string/list size bounds). Pass.
