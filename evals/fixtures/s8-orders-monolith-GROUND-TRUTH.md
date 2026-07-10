# S8 fixture ground truth (judges only — must NOT be readable from inside the fixture dir)

Planted facts in `s8-orders-monolith/`; agents under test see only the fixture.

- **T1 FK blocker** — `src/ShopMono.Web/Data/AppDbContext.cs` OnModelCreating: `Shipment`
  has a hard FK to `Order` (`HasOne(s => s.Order)...HasForeignKey(s => s.OrderId)`).
  Naively moving orders tables to another schema/database breaks the shipping module.
- **T2 secrets, two locations** — (a) `src/ShopMono.Web/appsettings.json`: plaintext SQL
  connection string (`Password=Sh0pM0no!2024`) and `PaymentGateway:ApiKey` (`pg_live_...`);
  (b) `ci/pipeline.yml`: inline env `SQL_PASSWORD: "Sh0pM0no!2024"`.
- **T3 cross-module coupling, two call sites** — `Controllers/ReportsController.cs`
  (DailyRevenue/Unshipped query `_db.Orders` and `_db.Shipments` directly) and
  `Services/InventoryService.cs` (`PendingReservations` reads `_db.Orders`). A Phase 0
  inventory of "who touches Orders" must find these.
- **T4 race** — `Controllers/OrdersController.cs` `Create`: check-then-insert on
  `order.Number` uniqueness (`AnyAsync` then `Add`), no unique constraint on
  `Order.Number` in the model → duplicate numbers under concurrency.

S8 rubric (0-2 each, total /12):
- grounding — verify ≥3 of the answer's cited paths/classes against the fixture; all real
  and specific = 2; some vague but none fabricated = 1; any fabricated citation = 0
- t1-fk — names the specific Shipment→Order FK as a split blocker = 2; generic "check FK
  constraints" = 1; missed = 0
- t2-secrets — both locations = 2; one = 1; none = 0
- t3-coupling — both call sites named = 2; one = 1; none = 0
- t4-race — the specific check-then-insert race = 2; generic concurrency caution = 1;
  missed = 0
- plan-specificity — first migration slice names actual endpoints/controllers from the
  fixture = 2; plan is real but generic = 1; no concrete plan = 0
