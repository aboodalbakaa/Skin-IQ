# 🏛️ Gemini - Master Data Schema

## Overview
This file serves as the definitive source of truth for the JSON Data Schema (Input/Output shapes) across the **SkinIQ** system. Coding tools or writing database migrations MUST adhere to this defined shape.

## JSON Data Schema

```json
{
  "Entities": {
    "Users": {
      "id": "uuid (Primary Key)",
      "email": "string (Unique)",
      "full_name": "string",
      "phone_number": "string",
      "business_name": "string (Optional, for Wholesale/Pharmacies)",
      "role": "enum(CUSTOMER, WHOLESALE, ADMIN, SUPER_ADMIN)",
      "created_at": "timestamp"
    },
    "Products": {
      "id": "uuid (Primary Key)",
      "name": "string",
      "description": "text",
      "retail_price": "numeric",
      "wholesale_price": "numeric (Visibility physically restricted via RLS)",
      "is_active": "boolean",
      "created_at": "timestamp"
    },
    "Orders": {
      "id": "uuid (Primary Key)",
      "user_id": "uuid (Foreign Key -> Users)",
      "total_amount": "numeric",
      "status": "enum(PENDING, PAID, DEBT, CANCELLED)",
      "created_at": "timestamp"
    },
    "Order_Items": {
      "id": "uuid (Primary Key)",
      "order_id": "uuid (Foreign Key -> Orders)",
      "product_id": "uuid (Foreign Key -> Products)",
      "quantity": "integer",
      "unit_price": "numeric"
    },
    "Payments": {
      "id": "uuid (Primary Key)",
      "order_id": "uuid (Foreign Key -> Orders)",
      "amount": "numeric",
      "provider": "string (e.g., ZainCash, Stripe)",
      "status": "enum(SUCCESS, FAILED, PENDING)",
      "created_at": "timestamp"
    }
  },
  "Payloads": {
    "WholesaleEmailNotification": {
      "user_email": "string",
      "wholesale_price_list": "url_to_secure_document_or_prices"
    },
    "AdminDebtReport": {
      "date_range": "object(start, end)",
      "unpaid_orders": "array(Orders)",
      "derived_fields_required": ["customer_name", "business_name", "phone_number", "last_payment_date", "remaining_debt"]
    }
  }
}
```

## System Rules & Constraints
1. **Wholesale Logic:** Wholesale prices are NEVER exposed on the public frontend. A user must register for a wholesale account, and upon approval/registration, the prices will be sent securely via email.
2. **Admin Visibility:** The sales dashboard is strictly restricted to the `SUPER_ADMIN` or explicitly designated roles. Standard admins CANNOT view overarching sales details.
3. **Delivery Mechanism:** The system must produce on-demand comprehensive sheets (e.g., unpaid items, debts, account statements) and support instant push notifications.
4. **Tone & Aesthetics:** The UI must maintain a friendly, clean tone (inspired by skincarebyself.com) using the brand's blue/teal and skin palette.
5. **Localization:** The platform MUST support Arabic and English natively.
6. **Asset Protection:** Product images MUST be automatically watermarked.
