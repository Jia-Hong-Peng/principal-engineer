using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopMono.Web.Data;
using ShopMono.Web.Models;

namespace ShopMono.Web.Controllers;

[ApiController]
[Route("api/inventory")]
public class InventoryController : ControllerBase
{
    private readonly AppDbContext _db;

    public InventoryController(AppDbContext db) => _db = db;

    [HttpGet("{sku}")]
    public async Task<ActionResult<InventoryItem>> GetBySku(string sku)
    {
        var item = await _db.InventoryItems.FirstOrDefaultAsync(i => i.Sku == sku);
        return item is null ? NotFound() : item;
    }
}
