using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NorthWind.Sales.Backend.Repositories.Entities;

namespace NorthWind.Sales.Backend.DataContexts.EFCore.EntityConfigurations;

internal sealed class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("Products");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Name).IsRequired().HasMaxLength(80);
        builder.Property(p => p.UnitPrice).HasColumnType("money");
        builder.HasData(
            new Product { Id = 1, Name = "Chai", UnitPrice = 35m, UnitsInStock = 20 },
            new Product { Id = 2, Name = "Chang", UnitPrice = 55m, UnitsInStock = 0 },
            new Product { Id = 3, Name = "Aniseed Syrup", UnitPrice = 65m, UnitsInStock = 20 },
            new Product { Id = 4, Name = "Chef Anton's Cajun Seasoning", UnitPrice = 75m, UnitsInStock = 40 },
            new Product { Id = 5, Name = "Chef Anton's Gumbo Mix", UnitPrice = 50m, UnitsInStock = 20 });
    }
}
