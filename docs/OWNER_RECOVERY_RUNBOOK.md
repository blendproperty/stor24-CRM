# Stor24 CRM owner recovery

Use this procedure only after confirming the requester through an approved out-of-band Stor24 process. Never ask for or transmit an existing password.

1. Prefer the normal **Forgot password** flow. Confirm that the configured email provider accepted delivery; do not inspect, log, or copy the reset token.
2. If the owner mailbox is inaccessible, a second authorised administrator should invite a replacement owner from **Users & permissions**, then revoke or deactivate the inaccessible account after the replacement signs in.
3. If no owner can sign in, schedule a controlled maintenance window. Back up the database, identify the exact organisation and owner record, and use a reviewed one-off administrative script to set a newly bcrypt-hashed temporary password and increment `sessionVersion`. Never paste plaintext into SQL or shell history.
4. Require the recovered owner to change the temporary password immediately. Confirm old sessions no longer work and review `AuditEvent` records for recovery, role, invitation, and account-status changes.
5. Rotate any bootstrap material exposed during recovery. `BOOTSTRAP_TOKEN_HASH` is only for an empty installation and must not be reused once an owner exists.

Record who approved and performed the recovery, timestamps, affected user ID, evidence of session invalidation, and follow-up actions. Do not record passwords, raw tokens, API keys, or full session cookies.
