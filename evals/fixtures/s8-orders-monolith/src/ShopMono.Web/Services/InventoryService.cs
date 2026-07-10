using Microsoft.EntityFrameworkCore;
using ShopMono.Web.Data;
using ShopMono.Web.Models;

namespace ShopMono.Web.Services;

public class InventoryService
{
    private readonly AppDbContext _db;

    public InventoryService(AppDbContext db) => _db = db;

    public async Task ReserveForOrder(Order order)
    {
        foreach (var line in order.Lines)
        {
            var item = await _db.InventoryItems.FirstOrDefaultAsync(i => i.Sku == line.Sku);
            if (item is not null)
            {
                item.Reserved += line.Quantity;
            }
        }
        await _db.SaveChangesAsync();
    }

    public async Task<int> PendingReservations()
    {
        // Inventory reaches into order rows to recompute reservations on startup.
        var paidOrders = await _db.Orders.Include(o => o.Lines)
            .Where(o => o.Status == "Paid").ToListAsync();
        return paidOrders.SelectMany(o => o.Lines).Sum(l => l.Quantity);
    }
}
