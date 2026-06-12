# Graph Report - .  (2026-06-08)

## Corpus Check
- Corpus is ~38,812 words - fits in a single context window. You may not need a graph.

## Summary
- 228 nodes · 348 edges · 16 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output
- Edge kinds: contains: 147 · imports_from: 110 · imports: 79 · calls: 10 · rationale_for: 2


## Input Scope
- Requested: auto
- Resolved: committed (source: default-auto)
- Included files: 98 · Candidates: 111
- Excluded: 0 untracked · 3 ignored · 0 sensitive · 0 missing committed
- Recommendation: Use --scope all or graphify.yaml inputs.corpus for a knowledge-base folder.

## Graph Freshness
- Built from Git commit: `2cdad7c`
- Compare this hash to `git rev-parse HEAD` before trusting freshness-sensitive graph output.
## God Nodes (most connected - your core abstractions)
1. `createClient()` - 23 edges
2. `useCartStore` - 11 edges
3. `createClient()` - 9 edges
4. `getAdminRole()` - 6 edges
5. `useFavoritesStore` - 5 edges
6. `updateBundleOffer()` - 4 edges
7. `updateProduct()` - 4 edges
8. `createAdminClient()` - 4 edges
9. `uploadImageToStorage()` - 3 edges
10. `deleteImageFromStorage()` - 3 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (11): Order, OrderItem, OrderManagementProps, updateOrderStatus(), createPromoCode(), deletePromoCode(), togglePromoStatus(), createClient() (+3 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (15): Product, Product, BundleOffer, BundleOffersCarouselProps, CartButtonDetailsProps, CartItem, CartStore, useCartStore (+7 more)

### Community 2 - "Community 2"
Cohesion: 0.10
Nodes (9): syncAppUser(), Order, CheckoutItem, CheckoutPayload, submitSpotOrder(), updateHeroConfig(), uploadHeroImage(), createAdminClient() (+1 more)

### Community 3 - "Community 3"
Cohesion: 0.10
Nodes (9): AdminSidebarProps, Order, PromoCodeDetails(), PromoCodeStatsProps, {Link, redirect, usePathname, useRouter, getPathname}, routing, cairo, metadata (+1 more)

### Community 4 - "Community 4"
Cohesion: 0.10
Nodes (8): RANGES, DebtReportProps, RecentOrdersProps, statusConfig, StatCardsProps, TopProductsProps, getDashboardStats(), getDebtReportData()

### Community 5 - "Community 5"
Cohesion: 0.25
Nodes (9): BundleOfferFormProps, BundleOffer, BundleOfferTableProps, createBundleOffer(), deleteBundleOffer(), deleteImageFromStorage(), toggleBundleActive(), updateBundleOffer() (+1 more)

### Community 6 - "Community 6"
Cohesion: 0.25
Nodes (9): Product, ProductFormProps, ProductTableProps, createProduct(), deleteImageFromStorage(), deleteProduct(), toggleProductActive(), updateProduct() (+1 more)

### Community 7 - "Community 7"
Cohesion: 0.15
Nodes (5): CategoryFilterProps, FilterableProductGridProps, Product, FilterableShowcaseProps, Product

### Community 8 - "Community 8"
Cohesion: 0.39
Nodes (5): Report, getDebtMatrixData(), getInventoryAuditData(), getPartnerDirectoryData(), getSalesSummaryData()

### Community 9 - "Community 9"
Cohesion: 0.38
Nodes (5): config, intlMiddleware, proxy(), routing, updateSession()

### Community 10 - "Community 10"
Cohesion: 0.40
Nodes (3): geistMono, geistSans, metadata

### Community 11 - "Community 11"
Cohesion: 0.67
Nodes (2): nextConfig, withNextIntl

### Community 12 - "Community 12"
Cohesion: 0.67
Nodes (2): MOCK: This tool simulates sending a secure email containing the wholesale price, send_wholesale_email()

### Community 13 - "Community 13"
Cohesion: 0.67
Nodes (2): apply_watermark(), Applies a transparent watermark logo to the specified image corner.

### Community 15 - "Community 15"
Cohesion: 1.00
Nodes (1): eslintConfig

### Community 16 - "Community 16"
Cohesion: 1.00
Nodes (1): config

## Knowledge Gaps
- **54 isolated node(s):** `eslintConfig`, `withNextIntl`, `nextConfig`, `config`, `AppUser` (+49 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 11`** (2 nodes): `nextConfig`, `withNextIntl`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (2 nodes): `MOCK: This tool simulates sending a secure email containing the wholesale price`, `send_wholesale_email()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (2 nodes): `apply_watermark()`, `Applies a transparent watermark logo to the specified image corner.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (1 nodes): `eslintConfig`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (1 nodes): `config`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createClient()` connect `Community 0` to `Community 5`, `Community 4`, `Community 6`, `Community 8`, `Community 2`, `Community 1`?**
  _High betweenness centrality (0.213) - this node is a cross-community bridge._
- **Why does `createClient()` connect `Community 2` to `Community 1`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `useCartStore` connect `Community 1` to `Community 2`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `withNextIntl`, `nextConfig` to the rest of the system?**
  _54 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08367071524966262 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08108108108108109 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.10344827586206896 - nodes in this community are weakly interconnected._