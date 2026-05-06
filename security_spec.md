# Security Specification for VibeKit ✨

## Data Invariants
1. All user-specific data (Tones, Analyses, Situations) must belong to a specific `userId` that matches the authenticated user.
2. Users can only read and write their own data.
3. System-generated fields like `createdAt` must be handled correctly.
4. Document IDs must be validated to prevent poisoning.

## The "Dirty Dozen" Payloads (Red Team Test Cases)

1. **Identity Theft (Create)**: Try to create a Tone for another user's ID.
2. **Identity Theft (Update)**: Try to update another user's Tone document.
3. **Ghost Fields**: Create an Analysis with an undocumented field `isAdmin: true`.
4. **Invalid IDs**: Create a document using a 2KB garbage string as ID.
5. **PII Leak**: Read the `/users` collection list as an unauthenticated user.
6. **Self-Promotion**: Try to update user profile to change metadata (though we don't have roles yet, good practice to block).
7. **Time Travel**: Provide a client-side `createdAt` timestamp from 1999.
8. **Resource Poisoning**: Send a 1MB string into the `label` field of a Tone.
9. **Status Hijacking**: If we had statuses, try to skip from 'pending' to 'completed'.
10. **Query Scrape**: Try to list all `analyses` without a filter.
11. **Orphened Write**: Create a Tone without a valid user document (Relational Sync).
12. **Type Confusion**: Send a number into a field expected to be a string.

## Red Team Audit Results
- **Identity Spoofing**: Blocked by `auth.uid` check.
- **State Shortcutting**: N/A (no terminal states yet).
- **Resource Poisoning**: Blocked by `.size()` checks on all strings.
- **PII Protection**: Isolated within `/users/{userId}`.
- **Relational Integrity**: Enforced by checking if user document exists.
