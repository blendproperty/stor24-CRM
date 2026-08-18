# HikCentral biometric facility access

## Ownership

The CRM owns consent, active-tenancy eligibility, provisioning state, audit and revocation. HikCentral owns the biometric template and door permission. The public website and CMS do not store or process face images in this release.

## Flow

1. An authorised staff member opens **Facial access** and selects an active occupancy.
2. Staff records explicit biometric consent and uploads a JPEG or PNG photograph (maximum 5 MB).
3. The server hashes the image for audit/deduplication, but does not persist the image bytes.
4. The HikCentral provider creates the person, uploads the face and assigns the facility's configured door group.
5. The CRM marks access active only after all three OpenAPI calls succeed.
6. Revocation removes the HikCentral permission and updates the occupancy. Move-out invokes the same revocation path automatically.

## Production configuration

Configure the server-only variables documented in `.env.example`. `HIKCENTRAL_FACILITY_CONFIG_JSON` maps CRM facility IDs to HikCentral organisation and door index codes. Never expose the app secret or the facility mapping to the browser.

The default OpenAPI paths are common HikCentral Professional paths. Before enabling writes, compare them with the Developer Guide installed alongside the exact HikCentral/OpenAPI release and override any versioned paths using environment variables.

## Safe activation checklist

- Confirm POPIA consent wording, retention period, deletion process and a non-biometric access alternative with the accountable business owner.
- Confirm the Midpoint HikCentral organisation index and every intended door index code.
- Use a dedicated least-privilege OpenAPI key permitted only to manage people, faces and access permissions.
- Test with one explicitly authorised staff profile first.
- Read the person and permission back in HikCentral before declaring the integration operational.
- Test revocation and confirm the terminal denies access.
- Apply the Prisma migration, configure secrets through the deployment environment, then deploy the CRM branch.
