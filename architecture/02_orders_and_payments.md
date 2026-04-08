# SOP 02: Orders, Payments & RBAC Reports

## Goal
Manage the checkout process, tracking payment statuses, and generating strictly controlled sales reports.

## Inputs
- User ID
- Cart Items (Products + Quantities)
- Payment Method (Stripe/ZainCash)

## Tool Logic
1.  **Checkout Initiation:** User submits cart. An `Order` is created with status `PENDING`.
2.  **Payment Gateway:** System interfaces with Stripe/ZainCash. 
3.  **Status Update:** On successful webhook return, `Orders` and `Payments` status become `PAID`. If deferred, it becomes `DEBT`.
4.  **Report Generation:** The `SUPER_ADMIN` can request a report of all `DEBT` orders. The system queries the `Orders` table joined with `Users` and exports a JSON or CSV format sheet.

## Edge Cases
- Standard Admins attempting to view overall sales metrics.
  - *Fix:* RLS policy on the `Orders` table prevents summary aggregations unless `auth.jwt() -> 'user_metadata' ->> 'role' = 'SUPER_ADMIN'`.
