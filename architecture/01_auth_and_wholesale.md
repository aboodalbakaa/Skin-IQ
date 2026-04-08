# SOP 01: Authentication & Wholesale Logistics

## Goal
Manage user roles (Customer, Wholesale, Admin, Super_Admin) and ensure that wholesale pricing is never exposed on the client side.

## Inputs
- User email
- Role request (default: CUSTOMER)

## Tool Logic
1.  **Registration:** Any new sign-up is automatically given the `CUSTOMER` role.
2.  **Wholesale Request:** If a user requests a wholesale account, their status is set to pending administrative review.
3.  **Role Elevation:** An `ADMIN` or `SUPER_ADMIN` can change a user's role to `WHOLESALE`.
4.  **Price Reveal:** The frontend fetches products, but the `wholesale_price` column is protected by Row Level Security (RLS). When a user becomes `WHOLESALE`, we trigger an automated email (e.g., via Resend or SendGrid) containing the secure price list or a Magic Link to a protected route.

## Edge Cases
- Overzealous users trying to scrape wholesale prices from the browser network tab.
  - *Fix:* Enforce RLS at the Supabase level so `wholesale_price` is entirely omitted from the JSON payload unless the requester's JWT contains `role = WHOLESALE`.
