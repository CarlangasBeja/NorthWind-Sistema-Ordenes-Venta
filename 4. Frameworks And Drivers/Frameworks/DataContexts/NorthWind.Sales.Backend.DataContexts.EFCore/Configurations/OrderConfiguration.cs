using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NorthWind.Sales.Backend.BusinessObjects.POCOEntities;
using NorthWind.Sales.Backend.Repositories.Entities;

namespace NorthWind.Sales.Backend.DataContexts.EFCore.EntityConfigurations;

internal sealed class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("Orders");
        builder.HasKey(o => o.Id);
        builder.Property(o => o.CustomerId).IsRequired().HasMaxLength(5).IsFixedLength();
        builder.Property(o => o.ShipAddress).IsRequired().HasMaxLength(60);
        builder.Property(o => o.ShipCity).IsRequired().HasMaxLength(15);
        builder.Property(o => o.ShipCountry).IsRequired().HasMaxLength(15);
        builder.Property(o => o.ShipPostalCode).HasMaxLength(10);
        builder.Property(o => o.Discount).IsRequired();
        builder.Property(o => o.OrderDate).IsRequired();
        builder.HasOne<Customer>()
            .WithMany()
            .HasForeignKey(o => o.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
