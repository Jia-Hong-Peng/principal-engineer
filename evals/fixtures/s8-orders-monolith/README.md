# ShopMono

Internal e-commerce backend: ASP.NET Core 8 monolith with EF Core on SQL Server.
Modules: orders, inventory, shipping, reporting. CI runs restore + tests (see `ci/pipeline.yml`).

Layout:
- `src/ShopMono.Web/` — web API project (controllers, EF Core DbContext, services)
- `ci/pipeline.yml` — build-and-test pipeline
