using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NorthWind.Sales.Backend.Repositories.Entities;

namespace NorthWind.Sales.Backend.DataContexts.EFCore.EntityConfigurations;

internal sealed class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        builder.ToTable("Customers");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).HasMaxLength(5).IsFixedLength();
        builder.Property(c => c.Name).IsRequired().HasMaxLength(60);
        builder.Property(c => c.CurrentBalance).HasColumnType("money");
        builder.HasData(
            new Customer { Id = "ALFKI", Name = "Alfreds Futterkiste", CurrentBalance = 0m },
            new Customer { Id = "ANATR", Name = "Ana Trujillo Emparedados y helados", CurrentBalance = 0m },
            new Customer { Id = "ANTON", Name = "Antonio Moreno Taquería", CurrentBalance = 100m });
    }
}
