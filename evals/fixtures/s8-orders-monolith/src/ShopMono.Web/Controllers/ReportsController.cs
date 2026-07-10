using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopMono.Web.Data;

namespace ShopMono.Web.Controllers;

[ApiController]
[Route("api/reports")]
public class ReportsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ReportsController(AppDbContext db) => _db = db;

    [HttpGet("daily-revenue")]
    public async Task<ActionResult<object>> DailyRevenue([FromQuery] DateTime date)
    {
        // Reporting reads order rows directly for aggregation.
        var total = await _db.Orders
            .Where(o => o.CreatedAt.Date == date.Date && o.Status != "Cancelled")
            .SumAsync(o => o.Total);
        var count = await _db.Orders.CountAsync(o => o.CreatedAt.Date == date.Date);
        return new { date = date.Date, revenue = total, orders = count };
    }

    [HttpGet("unshipped")]
    public async Task<ActionResult<object>> Unshipped()
    {
        var rows = await _db.Orders
            .Where(o => o.Status == "Paid")
            .Where(o => !_db.Shipments.Any(s => s.OrderId == o.Id))
            .Select(o => new { o.Id, o.Number, o.Total })
            .ToListAsync();
        return rows;
    }
}
