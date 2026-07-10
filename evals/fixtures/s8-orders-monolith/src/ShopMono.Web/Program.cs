using Microsoft.EntityFrameworkCore;
using ShopMono.Web.Data;
using ShopMono.Web.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("Default")));
builder.Services.AddScoped<InventoryService>();
builder.Services.AddControllers();

var app = builder.Build();
app.MapControllers();
app.Run();
