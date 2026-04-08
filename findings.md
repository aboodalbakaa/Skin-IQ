# 🔍 Findings: Idris - Wellness Project

## Research & Discoveries

### Infrastructure
- **Supabase Project Created:** `Idris Wellness`
- **Project Ref:** `tnntryefsskmhezkobxr`
- **Region:** `eu-central-1`

### Discovery Answers (Project Blueprint)
1.  **North Star:** An e-commerce platform that is incredibly simple for customers to seamlessly view details, purchase, and handle discounts. Concurrently, it acts as a robust internal sales management system. Built to be quickly converted into a mobile app in the near future.
2.  **Integrations:** Electronic payment gateways. No other systems (like Shopify or Slack) are currently required to be integrated in this initial phase.
3.  **Source of Truth:** A brand-new dedicated database (Supabase), strictly managed by one designated admin.
4.  **Delivery Payload:** Instant push notifications/alerts AND on-demand comprehensive dashboards/sheets (to filter unpaid items, debts, account statements).
5.  **Behavioral Rules:**
- **Tone & Aesthetics:** Friendly, simple, and intuitive. Brand colors are derived from specific blue/teal "skin" palettes. It should emulate the clean, cosmetic experience seen at `skincarebyself.com`.
    - **Wholesale Logic:** NEVER display wholesale prices to regular viewers. A user must register, and the prices will be sent securely via email.
    - **RBAC (Role-Based Access Control):** Detailed sales data is highly restricted. Only specific admins (with assigned permissions) are allowed to view the sales dashbaord. 
    - **Localization:** System must support both **Arabic** and **English** natively from the start with a user toggle.

### Detailed Sales Report Requirements
- Debt reports MUST include: Customer Name, Business/Pharmacy Name (if wholesale), Phone Number, Date of Last Payment, and Remaining Debt Amount.

### Media & Security
- **Watermarking:** Images uploaded to the platform must automatically receive a transparent logo watermark to protect intellectual property. The watermark must cleanly be placed in a corner of the image.

## Constraints & Limitations
- **Data Privacy:** Hard restriction on who sees wholesale pricing (only via email).
- **Admin View:** Hard restriction on overall sales dashboard access.
- **Multilingual Support:** The Next.js app must implement i18n routing/dictionaries from day one.
