# Database design

Postgres schema used by the HIQ Shop API in `../server` (source of truth: `server/prisma/schema.prisma`). The front-end uses it when `VITE_API_URL` is set; otherwise it runs on mock data and browser storage. See [API.md](API.md) and [ADMIN.md](ADMIN.md).

Conventions: every table has `id uuid` as its primary key; money is `int` centavos (PHP); dates are ISO 8601; `null` in a price, interval or spec means **[TBC]**, as on the site. Card and payment details are never stored, they stay on the commerce platform.

## Overview

How the areas connect. Columns are in the detailed diagrams below.

```mermaid
erDiagram
    CUSTOMERS ||--o{ ADDRESSES : has
    CUSTOMERS ||--o{ AUTH_OTPS : "signs in with"
    CUSTOMERS |o--o{ ORDERS : places
    ORDERS ||--|{ ORDER_LINES : contains
    PRODUCTS |o--o{ ORDER_LINES : "sold as"
    FILTER_SKUS |o--o{ ORDER_LINES : "sold as"
    SPARE_PARTS |o--o{ ORDER_LINES : "sold as"
    PRODUCTS ||--o{ FILTER_COMPATIBILITY : accepts
    FILTER_SKUS ||--o{ FILTER_COMPATIBILITY : fits
    PRODUCTS ||--o{ SPARE_PART_COMPATIBILITY : takes
    SPARE_PARTS ||--o{ SPARE_PART_COMPATIBILITY : fits
    CUSTOMERS ||--o{ UNITS : owns
    PRODUCTS ||--o{ UNITS : "installed as"
    ORDERS |o--o{ UNITS : "delivered as"
    UNITS ||--o{ SERVICE_BOOKINGS : "serviced by"
    UNITS ||--o{ FILTER_REMINDERS : schedules
    UNITS ||--o{ WARRANTY_CLAIMS : has
    UNITS ||--o{ SUBSCRIPTIONS : "covered by"
    CUSTOMERS ||--o{ LOYALTY_TRANSACTIONS : earns
    PRODUCTS |o--o{ LEADS : "asked about"
    ADMIN_USERS ||--o{ AUDIT_LOG : records
```

## Customers and sign-in

`password_hash` matches the current register page; `AUTH_OTPS` supports the one-time-code sign-in planned in API.md. Keep one or both.

```mermaid
erDiagram
    CUSTOMERS ||--o{ ADDRESSES : has
    CUSTOMERS ||--o{ AUTH_OTPS : "signs in with"

    CUSTOMERS {
        uuid id PK
        varchar first_name
        varchar last_name
        varchar email UK
        varchar phone
        varchar password_hash "null if OTP sign-in only"
        boolean marketing_opt_in
        timestamp email_verified_at
        timestamp created_at
        timestamp updated_at
    }
    ADDRESSES {
        uuid id PK
        uuid customer_id FK
        varchar label "Home, Office"
        varchar line1
        varchar line2
        varchar city
        varchar province
        varchar postal
        boolean is_default
        timestamp created_at
        timestamp updated_at
    }
    AUTH_OTPS {
        uuid id PK
        uuid customer_id FK
        varchar channel "sms or email"
        varchar destination
        varchar code_hash
        int attempts "max 5 wrong codes"
        timestamp expires_at
        timestamp used_at
        timestamp created_at
    }
```

## Catalogue

Needs, filtration types and configurations are lookup tables so the shop filters and the Find My System quiz can join on them. `slug` never changes once created.

Two kinds of thing are sold besides systems:
- **Replacement filters** (`filter_skus`) are made for specific HIQ models and drive filter reminders and subscriptions.
- **Spare parts** (`spare_parts`) are fittings, tubing, faucets, valves, housings and general-purpose cartridges. Each size is its own row with its own SKU. A part with no rows in `spare_part_compatibility` fits any system of that size. `unit` says what the price and quantity count: a piece, a meter of tubing or a pack.

```mermaid
erDiagram
    PRODUCTS ||--o{ PRODUCT_IMAGES : shows
    PRODUCTS ||--o{ PRODUCT_SPECS : "described by"
    PRODUCTS ||--o{ PRODUCT_NEEDS : suits
    NEEDS ||--o{ PRODUCT_NEEDS : "applies to"
    PRODUCTS ||--o{ PRODUCT_FILTRATIONS : uses
    FILTRATION_TYPES ||--o{ PRODUCT_FILTRATIONS : "used by"
    PRODUCTS ||--o{ PRODUCT_CONFIGURATIONS : "offered as"
    CONFIGURATIONS ||--o{ PRODUCT_CONFIGURATIONS : "available on"
    PRODUCTS ||--o{ FILTER_COMPATIBILITY : accepts
    FILTER_SKUS ||--o{ FILTER_COMPATIBILITY : fits
    PRODUCTS ||--o{ SPARE_PART_COMPATIBILITY : takes
    SPARE_PARTS ||--o{ SPARE_PART_COMPATIBILITY : fits

    PRODUCTS {
        uuid id PK
        varchar slug UK "never changes"
        varchar model
        varchar category "under-sink, countertop, dispensers, whole-house, commercial, industrial, emergency"
        varchar channel "shop or quote"
        boolean hot_cold
        varchar install
        int tds_limit
        boolean is_entry
        boolean is_bottleless
        boolean is_table_top
        boolean is_office
        text summary
        jsonb highlights
        int price_centavos "null = TBC"
        int warranty_months "null = TBC"
        boolean warranty_tbc "shows the WARRANTY TBC tag"
        varchar store_url
        int featured_rank
        boolean is_hidden
        timestamp created_at
        timestamp updated_at
    }
    PRODUCT_IMAGES {
        uuid id PK
        uuid product_id FK
        varchar src
        varchar alt
        int sort_order "0 = main photo"
        timestamp created_at
    }
    PRODUCT_SPECS {
        uuid id PK
        uuid product_id FK
        varchar spec_key "unique per product"
        varchar spec_value "null = TBC"
        int sort_order
    }
    NEEDS {
        uuid id PK
        varchar code UK "home, condo, office, business"
        varchar label
    }
    PRODUCT_NEEDS {
        uuid product_id PK, FK
        uuid need_id PK, FK
    }
    FILTRATION_TYPES {
        uuid id PK
        varchar code UK "UF, Nano, RO, UV, Alkaline"
        varchar label
    }
    PRODUCT_FILTRATIONS {
        uuid product_id PK, FK
        uuid filtration_type_id PK, FK
    }
    CONFIGURATIONS {
        uuid id PK
        varchar name UK "Hot and Cold"
    }
    PRODUCT_CONFIGURATIONS {
        uuid product_id PK, FK
        uuid configuration_id PK, FK
        int sort_order
    }
    FILTER_SKUS {
        uuid id PK
        varchar sku "make unique once SKUs are confirmed"
        varchar name
        varchar stage
        int interval_months "null = TBC"
        int price_centavos "null = TBC"
        text note
        int sort_order
        timestamp created_at
        timestamp updated_at
    }
    FILTER_COMPATIBILITY {
        uuid filter_sku_id PK, FK
        uuid product_id PK, FK
    }
    SPARE_PARTS {
        uuid id PK
        varchar slug UK "never changes"
        varchar sku "[PART SKU TBC] until confirmed"
        varchar name "includes the size"
        varchar category "fittings, hoses-tubing, filter-cartridges, faucets, valves, housings, other"
        text description
        json specs "label to value, null = TBC; json keeps the label order"
        jsonb images "[{ src, alt }], first = main photo"
        varchar unit "piece, meter or pack"
        int price_centavos "per unit, null = TBC"
        boolean is_hidden
        int sort_order
        timestamp created_at
        timestamp updated_at
    }
    SPARE_PART_COMPATIBILITY {
        uuid spare_part_id PK, FK
        uuid product_id PK, FK
    }
    SITE_PHOTOS {
        uuid id PK
        varchar photo_key UK
        varchar src
        varchar alt
        timestamp updated_at
    }
```

## Orders

Guests can check out, so `customer_id` is optional and the contact and delivery details are copied onto the order. Each line is exactly one of: a product, a replacement filter or a spare part. Products and filters go up to 20 per line; spare parts up to 500, for tubing by the meter and reseller packs.

```mermaid
erDiagram
    CUSTOMERS |o--o{ ORDERS : places
    ORDERS ||--|{ ORDER_LINES : contains
    PRODUCTS |o--o{ ORDER_LINES : "sold as"
    FILTER_SKUS |o--o{ ORDER_LINES : "sold as"
    SPARE_PARTS |o--o{ ORDER_LINES : "sold as"

    ORDERS {
        uuid id PK
        varchar order_number UK "HIQ-XXXXXX"
        uuid customer_id FK "null = guest"
        varchar contact_name
        varchar contact_email
        varchar contact_phone
        varchar ship_line1
        varchar ship_city
        varchar ship_province
        varchar ship_postal
        varchar status "pending, paid, shipped, delivered, cancelled"
        int subtotal_centavos
        int delivery_fee_centavos "null = TBC"
        int total_centavos
        boolean requires_quote "a line has no confirmed price"
        varchar payment_method "card, gcash, maya, online_banking"
        varchar platform_order_ref
        date install_preferred_date
        varchar install_preferred_slot "morning or afternoon"
        timestamp created_at
        timestamp updated_at
    }
    ORDER_LINES {
        uuid id PK
        uuid order_id FK
        uuid product_id FK "product lines only"
        uuid filter_sku_id FK "filter lines only"
        uuid spare_part_id FK "spare part lines only"
        varchar name "snapshot"
        varchar mode "buy or rent"
        varchar configuration
        boolean with_installation
        int qty
        int unit_price_centavos "null = quote"
    }
```

## After-sales: units, service, filters

A unit is one installed system. It drives the account area: filter due dates, reminders, service history and warranty.

```mermaid
erDiagram
    CUSTOMERS ||--o{ UNITS : owns
    PRODUCTS ||--o{ UNITS : "installed as"
    ADDRESSES ||--o{ UNITS : "located at"
    ORDERS |o--o{ UNITS : "delivered as"
    UNITS ||--o{ SERVICE_HISTORY : logs
    CUSTOMERS |o--o{ SERVICE_BOOKINGS : requests
    UNITS |o--o{ SERVICE_BOOKINGS : "serviced by"
    ADDRESSES |o--o{ SERVICE_BOOKINGS : "visit at"
    SERVICE_BOOKINGS |o--o| SERVICE_HISTORY : "results in"
    UNITS ||--o{ WARRANTY_CLAIMS : has
    SERVICE_BOOKINGS |o--o| WARRANTY_CLAIMS : "handled by"
    UNITS ||--o{ FILTER_REMINDERS : schedules
    FILTER_SKUS ||--o{ FILTER_REMINDERS : "due for"
    CUSTOMERS ||--o{ SUBSCRIPTIONS : subscribes
    UNITS ||--o{ SUBSCRIPTIONS : "covered by"
    SUBSCRIPTIONS ||--|{ SUBSCRIPTION_ITEMS : ships
    FILTER_SKUS ||--o{ SUBSCRIPTION_ITEMS : "included in"
    CUSTOMERS ||--o{ LOYALTY_TRANSACTIONS : earns
    ORDERS |o--o{ LOYALTY_TRANSACTIONS : awards

    UNITS {
        uuid id PK
        uuid customer_id FK
        uuid product_id FK
        uuid address_id FK
        uuid order_id FK "null if bought offline"
        varchar configuration
        varchar serial_number
        date installed_at
        date next_filter_due_at
        date warranty_ends_at
        varchar warranty_status "active, expired, void"
        timestamp created_at
        timestamp updated_at
    }
    SERVICE_HISTORY {
        uuid id PK
        uuid unit_id FK
        uuid booking_id FK, UK "null if not booked online"
        date service_date
        varchar service_type
        text notes
        varchar technician_name
        timestamp created_at
    }
    SERVICE_BOOKINGS {
        uuid id PK
        uuid customer_id FK "null = guest"
        uuid unit_id FK "null = new installation"
        uuid address_id FK "null = guest"
        varchar contact_name
        varchar contact_phone
        varchar contact_email
        text visit_address "snapshot"
        varchar service "installation, water-test, maintenance, filter-replacement, warranty, troubleshooting, general"
        date preferred_date
        varchar preferred_slot "morning, afternoon, late-afternoon"
        text notes
        varchar status "requested, confirmed, done, cancelled"
        timestamp created_at
        timestamp updated_at
    }
    WARRANTY_CLAIMS {
        uuid id PK
        uuid unit_id FK
        uuid booking_id FK
        text description
        varchar status "submitted, approved, rejected, resolved"
        timestamp created_at
        timestamp updated_at
    }
    FILTER_REMINDERS {
        uuid id PK
        uuid unit_id FK
        uuid filter_sku_id FK "null = all filters on the unit"
        date due_at
        timestamp sent_30d_at
        timestamp sent_7d_at
        timestamp completed_at
        timestamp created_at
    }
    SUBSCRIPTIONS {
        uuid id PK
        uuid customer_id FK
        uuid unit_id FK
        int interval_months
        date next_ship_at
        varchar status "active, paused, cancelled"
        timestamp created_at
        timestamp updated_at
    }
    SUBSCRIPTION_ITEMS {
        uuid subscription_id PK, FK
        uuid filter_sku_id PK, FK
        int qty
    }
    LOYALTY_TRANSACTIONS {
        uuid id PK
        uuid customer_id FK
        uuid order_id FK "null for manual adjustments"
        int points "positive earns, negative redeems"
        varchar reason
        timestamp created_at
    }
```

Subscriptions and loyalty are optional until HIQ confirms the offers ([CONFIRM SUBSCRIPTION OFFER], [CONFIRM PROGRAMME]).

## Sales and admin

```mermaid
erDiagram
    PRODUCTS |o--o{ LEADS : "asked about"
    ADMIN_USERS ||--o{ AUDIT_LOG : records

    LEADS {
        uuid id PK
        varchar lead_type "quote, rental, contact, newsletter, business"
        varchar name
        varchar email
        varchar phone
        varchar company
        text message
        uuid product_id FK "null if general"
        jsonb details "other form fields"
        varchar utm_source
        varchar utm_medium
        varchar utm_campaign
        varchar status "new, contacted, won, lost"
        timestamp created_at
        timestamp updated_at
    }
    ADMIN_USERS {
        uuid id PK
        varchar email UK
        varchar name
        varchar password_hash
        varchar role "owner or editor"
        timestamp last_login_at
        timestamp created_at
        timestamp updated_at
    }
    AUDIT_LOG {
        uuid id PK
        uuid admin_user_id FK
        varchar entity "products, filter_skus, spare_parts, site_photos"
        uuid entity_id
        varchar action "create, update, delete"
        jsonb changes
        timestamp created_at
    }
```
