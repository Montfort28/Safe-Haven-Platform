# Safe Haven Admin Guide

This guide describes the first administrator area and its current boundaries.
Admin sign-in, a privacy-limited overview, a paginated anonymous account
registry, database connectivity, and affirmation management are implemented.
Some service metrics and broader content-management functions are not yet
available.

## What Safe Haven users do

Users can create an account and use the platform to:

- Record mood check-ins and review mood patterns.
- Write private journal entries and gratitude reflections.
- Play wellbeing activities and track progress.
- Nurture a Mind Garden through caring activities.
- Use breathing, meditation, and calming audio tools.
- Browse wellbeing resources, stories, and articles.
- View their own dashboard, streaks, achievements, and profile.

These features can reveal sensitive information about a person's wellbeing.
Admin tools should support the service without turning personal reflections
into material for routine staff review.

## Recommended admin overview

The first screen should answer: **Is Safe Haven working, are people able to use
it, and where should I focus attention?**

| Area | Useful information |
| --- | --- |
| Platform health | Application/API availability, recent errors, database connectivity, and background-job status if jobs are introduced. |
| Adoption | Total accounts, new accounts over time, and active accounts over a selected period. |
| Feature engagement | Aggregate counts of mood check-ins, journal entries, completed activities, resource visits, and Mind Garden interactions. |
| Return use | Aggregate weekly/monthly return rates and streak distributions, presented as trends rather than individual rankings. |
| Content | Whether resources and affirmations are current, links work, and published content has been reviewed. |
| Privacy and safety | Access/audit events, account or data requests awaiting action, and documented escalation procedures—without displaying private journal or mood-note content. |

Provide date-range filters and clear definitions for every metric. Prefer
aggregate totals and trends. Avoid leaderboards or comparisons that could shame
users or present wellbeing as a competition.

## Recommended admin sections

### 1. Overview

Show a small set of operational and product indicators:

- New and active accounts for the selected period.
- Use of each feature, aggregated across users.
- Account creation and return-use trends.
- Error rate and service availability.
- Resource link failures or content awaiting review.

When reporting aggregates, suppress very small groups where an individual
could be identified from a rare activity or filter combination.

### 2. Content management

Provide a controlled way to maintain:

- Wellbeing articles, videos, and external platform links.
- Affirmations and reflection prompts.
- Activity descriptions and help text.
- Emergency and support-resource information.

For each item, record its source, reviewer, last-reviewed date, publication
status, and next review date. Validate external links and identify content that
may be outdated. Clearly label external services and avoid implying that Safe
Haven endorses or clinically verifies a service unless that review has happened.

### 3. Service and data operations

Give the administrator visibility into:

- API and application errors, grouped by route and time.
- Database connectivity and backup status.
- Background tasks, if the product adds scheduled work.
- Failed email or notification delivery, if those are introduced.
- Recent deployments and operational incidents.

Operational logs should not include passwords, authentication tokens, journal
text, mood notes, or other unnecessary personal information. Provide a
documented backup and restore process and periodically test it.

### 4. Account support

Support actions may include searching for an account by a stable identifier,
reviewing account creation time and account status, helping with account
recovery, and processing deletion or data requests.

Use the least amount of account information needed for the task. Avoid
impersonating users. If a support workflow requires access to user data, require
a specific reason, record the action, and restrict that access to authorized
administrators.

### 5. Safety and escalation

Safe Haven is a wellbeing companion, not an emergency service or clinical
monitoring system. The admin area should not suggest that staff are watching
users' private reflections in real time.

- Keep clear, current emergency-support guidance visible to users.
- Define what the team should do if a user directly contacts the service for
  urgent help.
- Explain the limits of the service and expected response times.
- Do not create automated crisis labels from private journal or mood text
  without a carefully reviewed, consent-based safety design.
- Do not promise intervention or monitoring that the service cannot reliably
  provide.

### 6. Admin access and audit

Admin access should be separate from an ordinary user account and protected
with:

- A server-enforced admin role; hiding an admin link in the UI is not access
  control.
- Strong authentication, ideally multi-factor authentication.
- Least-privilege roles if more than one administrator is added.
- Audit records for sign-ins, exports, account support actions, content
  changes, and permission changes.
- Session expiration, secure recovery procedures, and alerts for unusual
  access.

Never expose an admin credential, secret, or service token in client-side code.

## Recommended first release

The first admin release provides a small overview, an anonymous account
registry, and basic affirmation management. Future work should focus on:

1. Durable audit records and persistent login rate limiting.
2. API error summaries, backup checks, and deployment history.
3. External resource review dates, source attribution, and broken-link
   reporting.
4. A clear privacy notice explaining which aggregate metrics are collected.

Add account support and broader external-content editing only after access
controls, audit records, and recovery procedures are in place. Avoid a broad
"view user data" screen.

## Current implementation status

The admin account is configured outside the database using environment
variables. Set these on the server and restart the application:

For local development only, this workspace has a demo account configured in
the ignored `.env.local` file:

```text
Email:    admin@safehaven.test
Password: SafeHaven-Demo-Admin-2026!
```

These are public demo credentials, not a secure production password. Before
deployment, replace both with unique private values configured in the hosting
environment; never deploy using the demo password.

`JWT_SECRET` must also be configured. Keep all three values outside source
control and never share them in browser code. The admin sign-in page is at
`/admin/login`.

Implemented:

- Admin-only sign-in with a separate, HTTP-only, eight-hour admin session.
- Server-side checks on admin API routes.
- A paginated registry showing only an ordinal account label and registration
  date. The API does not return account IDs, names, emails, or usernames.
- The registry includes accounts still present in the application database.
  Account deletion cascades remove the user row, so it is not a historical
  record of deleted accounts.
- Aggregate feature counts and active-account counts for 7-, 30-, or 90-day
  periods. Counts below five are suppressed.
- A live database connectivity check.
- Adding affirmations and activating/deactivating existing affirmation
  records.

Not currently implemented:

- Per-user mood data, journal text, profile details, or other personal data in
  admin screens. Admin APIs do not expose those fields.
- Editing the hard-coded external resource, story, video, and support-link
  catalog, or recording source/reviewer/review-date metadata for those items.
- API error telemetry, backup monitoring, deployment history, or incident
  management. The dashboard marks these as not configured instead of
  estimating them.
- Durable audit records for admin sign-ins and content changes, multi-factor
  authentication, or persistent login rate limiting. Add these before
  expanding access or using this for production administration.

Before implementing them, decide who may hold admin access, what data is truly
needed, how long operational records are kept, and how users can request
access to or deletion of their account data. Have privacy and safety decisions
reviewed before collecting or exposing sensitive wellbeing information.
