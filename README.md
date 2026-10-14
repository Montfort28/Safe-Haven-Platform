# Safe Haven

**Find your peace, at your pace.**

Safe Haven is a digital wellbeing project designed to make everyday emotional
care feel more approachable. It brings simple tools for reflection, mood
awareness, calming activities and self-guided support together in one welcoming
place.

## The idea

Talking about mental health can still feel difficult in many communities.
People may worry about stigma, not know where to begin, or have limited access
to support that feels private, affordable and relevant to their lives. These
challenges are not unique to Rwanda, but they make it especially important to
create more entry points for honest conversations and everyday wellbeing
support across Rwanda and Africa.

Safe Haven is being built as one such entry point: a gentle, private-feeling
space to pause, check in with yourself and try small supportive practices.
It is intended to complement—not replace—trusted relationships, qualified
mental health professionals or emergency services.

## What Safe Haven offers

The current project includes:

- **Mood check-ins and insights** to help people reflect on feelings and notice
  patterns over time.
- **Guided journaling and gratitude** for recording thoughts and moments worth
  remembering.
- **Mind Garden** activities that connect regular self-care with a growing
  virtual garden.
- **Relaxation and meditation tools**, including breathing activities and
  calming audio.
- **Wellbeing games and progress tracking** that make short, constructive
  activities easier to return to.
- **Affirmations and wellbeing resources** for encouragement and further
  reading.
- **Accounts and a personal dashboard** to bring a person's activities
  together.

The homepage also introduces other mental health platforms as separate options
for visitors who want to explore additional services.

## Why it matters in Rwanda and across Africa

Safe Haven's focus is to help make the first step into wellbeing easier and
less intimidating. A digital space can offer people a discreet way to reflect
and build small habits on their own schedule, while helping make mental health
part of ordinary conversations rather than something to hide.

The project's long-term direction is grounded in local relevance: listening to
people in Rwanda and across African communities, using respectful and
non-judgmental language, and making room for local cultures, languages and
support pathways. Those priorities need ongoing community input; they should
not be assumed on behalf of the people the platform hopes to serve.

Safe Haven does not diagnose conditions or provide clinical treatment. People
in distress should be encouraged to seek help from qualified professionals,
trusted local services or emergency support.

## Project pitch

> Safe Haven is a digital wellbeing companion built to make everyday mental
> health care feel more approachable in Rwanda and across Africa. With mood
> check-ins, journaling, calming activities, games and supportive resources in
> one welcoming space, it helps people take small steps toward understanding
> themselves and caring for their wellbeing—at their own pace. It is a starting
> point for reflection and connection, not a replacement for professional care.

## Who it is for

Safe Haven is intended for people who want approachable ways to reflect, build
healthy routines or find a starting point for a wellbeing conversation. It may
also be useful to organizations and community groups looking for supportive,
non-clinical tools to introduce wellbeing activities.

## Development status

Safe Haven is an evolving project. The features listed above describe the
current application areas; availability, accessibility, translations, local
referrals and production readiness should be validated as development
continues. The platform should be tested with the communities it aims to serve
before making strong claims about its impact.

## Technology

- Next.js 15 and React
- TypeScript
- PostgreSQL
- Prisma ORM
- Tailwind CSS

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure the environment variables used by the app:

   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
   JWT_SECRET="replace-with-a-long-random-secret"
   ```

   Keep real credentials in your local environment and never commit them.

3. Generate the Prisma client and sync the development database:

   ```bash
   npm run prisma:generate
   npm run prisma:push
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## Sharing the project

When introducing Safe Haven on social media, focus on the simple promise:
**a welcoming place to check in with yourself and take one small step toward
wellbeing**. Be clear that the platform is not a substitute for professional
care, and avoid promising clinical outcomes.

**Short social introduction**

> Meet Safe Haven: a gentle space to check in, reflect and find small ways to
> care for your wellbeing. Built with Rwanda and African communities in mind,
> and growing one thoughtful step at a time. Find your peace, at your pace.
