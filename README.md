# 🦅 Mac Falcon

> Give your AI a body.

Mac Falcon is a robotics kit platform that puts your Mac Mini on wheels. Untethered, mobile, and ready for cameras and arms — built for makers who want their AI to move.

## Stack

- **Next.js 15** (App Router)
- **TypeScript + Tailwind CSS**
- **Drizzle ORM + Neon** (PostgreSQL)
- **better-auth** (email/password + OAuth)
- **Stripe** (checkout + webhooks)
- **Vercel** (deployment)

## Getting Started

```bash
bun install
cp .env.example .env.local
# fill in env vars
bun run db:push
bun run dev
```

## Environment Variables

```
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PUBLISHABLE_KEY=
RESEND_API_KEY=
```

## Project Structure

```
src/
  app/
    page.tsx            # Landing / homepage
    (store)/
      shop/             # Product listing + detail pages
      orders/           # Order management
      success/          # Post-checkout confirmation
    api/
      auth/             # better-auth handler
      stripe/
        checkout/       # Create Stripe checkout session
        webhook/        # Stripe event handler (order creation)
  components/
    BuyButton.tsx       # Client-side buy flow
  lib/
    auth.server.ts
    auth.client.ts
    stripe.ts
data/
  schema.ts             # Drizzle schema (users, products, orders)
  db.ts                 # Neon DB client
```

## Roadmap

- [ ] M4-D2 Mobility Kit v1 (iRobot Create 3 + Lego Technic + Anker 737)
- [ ] BOM + build instructions PDF bundled with each order
- [ ] Camera expansion kit
- [ ] Arm expansion kit
- [ ] Community build gallery
