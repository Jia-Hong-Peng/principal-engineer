using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopMono.Web.Data;
using ShopMono.Web.Models;
using ShopMono.Web.Services;

namespace ShopMono.Web.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly InventoryService _inventory;

    public OrdersController(AppDbContext db, InventoryService inventory)
    {
        _db = db;
        _inventory = inventory;
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Order>> GetById(int id)
    {
        var order = await _db.Orders.Include(o => o.Lines).FirstOrDefaultAsync(o => o.Id == id);
        return order is null ? NotFound() : order;
    }

    [HttpGet]
    public async Task<ActionResult<List<Order>>> List([FromQuery] string? status)
    {
        var q = _db.Orders.AsQueryable();
        if (!string.IsNullOrEmpty(status)) q = q.Where(o => o.Status == status);
        return await q.OrderByDescending(o => o.CreatedAt).Take(100).ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Order>> Create(Order order)
    {
        // Ensure the order number is unique before inserting.
        var exists = await _db.Orders.AnyAsync(o => o.Number == order.Number);
        if (exists) return Conflict($"order number {order.Number} already used");

        order.CreatedAt = DateTime.UtcNow;
        _db.Orders.Add(order);
        await _db.SaveChangesAsync();
        await _inventory.ReserveForOrder(order);
        return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
    }
}
