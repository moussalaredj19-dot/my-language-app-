# Security Specification — My Language

## Data Invariants
1. User profiles at `/users/{userId}` contain PII (`email`, `displayName`) and may only be read, created, or updated by `request.auth.uid == userId`.
2. Public discovery at `/publicProfiles/{userId}` and `/friendLookup/{lookupId}` contains ZERO PII (`email` is strictly excluded; email-based friend search hashes lowercase emails client-side with SHA-256 into deterministic lookup IDs `email_<sha256>`). `allow list` is `false` on both collections to prevent user scraping.
3. Every subcollection under `/users/{userId}/...` (`lessonProgress`, `vocabulary`, `notifications`, `weeklyChallenges`, `friends`) enforces the Master Gate (`exists(/users/{userId})` with matching `uid`) and strict `userId == request.auth.uid` ownership.
4. Direct friend chat threads at `/friendChats/{chatId}` bind `chatId == uidA + '_' + uidB` (`uidA != uidB`) and restrict reads/writes exclusively to participants `uidA` and `uidB`.
5. Messages under `/friendChats/{chatId}/messages/{messageId}` denormalize `uidA` and `uidB` so `allow list` enforces participant checks directly on `resource.data` without calling `get()`, while `allow create` verifies parent chat existence, `senderId == request.auth.uid`, and `createdAt == request.time`.
6. All document IDs are hardened via `isValidId(id)` (`^[a-zA-Z0-9_-]+$`, `<= 128` chars), and immutable ownership/timestamp fields cannot be forged.

## Dirty Dozen Adversarial Payloads (Expected: PERMISSION_DENIED)
1. Unauthenticated read on `/users/user123` or `/publicProfiles/user123`.
2. Authenticated user A listing `/publicProfiles` or `/friendLookup` (Enumeration / scraping attack).
3. Creating `/publicProfiles/userA` with an `email` shadow field (PII leak / schema poisoning).
4. Creating `/friendLookup/code_ML-FAKE` as User A with `uid: "userB"` (Directory spoofing).
5. Authenticated user C reading or listing `/friendChats/userA_userB` or its messages (Eavesdropping).
6. Creating `/friendChats/userA_userB` with mismatched `chatId` or `uidA == uidB` (Self-chat / ID bypass).
7. Creating `/friendChats/userA_userB/messages/m1` as User A with `senderId: "userB"` (Message impersonation).
8. Creating `/friendChats/userA_userB/messages/m2` with `text` > 1000 chars or fake `createdAt` (Resource poisoning / temporal tampering).
9. Creating `/users/userA/friends/bad$id` with invalid characters (ID poisoning).
10. User B listing `/users/userA/friends` or `/users/userA/vocabulary` (Cross-tenant list scraping).
11. Updating a completed `/users/userA/weeklyChallenges/c1` after `status == 'completed'` (Terminal state bypass).
12. Deleting `/users/userA` or `/friendChats/userA_userB/messages/m1` from client SDK (Prevented record deletion).
