using System.Globalization;
using System.Text;
using NorthWind.Sales.Entities.Dtos.Queries;

namespace NorthWind.Sales.Backend.Controllers.Queries;

internal static class InvoicePdfBuilder
{
    private const double PageWidth = 595;
    private const double PageHeight = 842;
    private const int RowsPerPage = 14;

    public static byte[] Build(OrderInvoiceDto invoice)
    {
        var details = invoice.Details.ToArray();
        var totalPages = Math.Max(1, (int)Math.Ceiling(details.Length / (double)RowsPerPage));
        var pageStreams = new List<byte[]>(totalPages);

        for (var pageIndex = 0; pageIndex < totalPages; pageIndex++)
        {
            var pageDetails = details.Skip(pageIndex * RowsPerPage).Take(RowsPerPage).ToArray();
            var isLastPage = pageIndex == totalPages - 1;
            pageStreams.Add(BuildPage(invoice, pageDetails, pageIndex + 1, totalPages, isLastPage));
        }

        return BuildDocument(pageStreams);
    }

    private static byte[] BuildPage(
        OrderInvoiceDto invoice,
        IReadOnlyList<OrderInvoiceDetailDto> details,
        int pageNumber,
        int totalPages,
        bool isLastPage)
    {
        var c = new StringBuilder();

        // Fondo y encabezado corporativo.
        FillRect(c, 0, 0, PageWidth, PageHeight, 1, 1, 1);
        FillRect(c, 0, 758, PageWidth, 84, .045, .106, .208);
        FillRect(c, 42, 780, 46, 38, .145, .388, .922);
        Text(c, "NW", 55, 793, 15, true, 1, 1, 1);
        Text(c, "NORTHWIND", 102, 799, 17, true, 1, 1, 1);
        Text(c, "Gestión de ventas", 102, 782, 9, false, .72, .79, .90);
        TextRight(c, "ORDEN DE VENTA GENERADA", 552, 803, 10, true, .74, .82, .94);
        TextRight(c, invoice.InvoiceNumber, 552, 782, 15, true, 1, 1, 1);

        if (pageNumber == 1)
        {
            Text(c, "DATOS DE LA ORDEN DE VENTA", 42, 731, 8, true, .145, .388, .922);
            Text(c, "Fecha de emisión", 42, 711, 8, false, .39, .45, .55);
            Text(c, invoice.OrderDate.ToString("dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture), 42, 695, 10, true, .09, .13, .20);

            Text(c, "Cliente", 205, 711, 8, false, .39, .45, .55);
            Text(c, $"{invoice.CustomerId} · {Truncate(invoice.CustomerName, 34)}", 205, 695, 10, true, .09, .13, .20);

            StrokeRect(c, 42, 638, 511, 43, .86, .89, .93, .8);
            Text(c, "DIRECCIÓN DE ENTREGA", 54, 663, 7.5, true, .39, .45, .55);
            Text(c, Truncate(invoice.ShipAddress, 58), 54, 647, 9.5, true, .09, .13, .20);
            TextRight(c, Truncate($"{invoice.ShipCity}, {invoice.ShipCountry} {invoice.ShipPostalCode}", 38), 541, 647, 8.5, false, .39, .45, .55);
        }
        else
        {
            Text(c, $"Continuación · {invoice.CustomerId} - {Truncate(invoice.CustomerName, 42)}", 42, 724, 9, false, .39, .45, .55);
        }

        var tableTop = pageNumber == 1 ? 610d : 692d;
        DrawTableHeader(c, tableTop);
        var y = tableTop - 24;

        foreach (var detail in details)
        {
            DrawLine(c, 42, y - 5, 553, y - 5, .91, .93, .96, .55);
            Text(c, $"#{detail.ProductId}", 52, y + 2, 8.5, true, .145, .388, .922);
            Text(c, Truncate(detail.ProductName, 37), 93, y + 2, 9, false, .09, .13, .20);
            TextRight(c, detail.Quantity.ToString(CultureInfo.InvariantCulture), 382, y + 2, 9, false, .09, .13, .20);
            TextRight(c, Money(detail.UnitPrice), 470, y + 2, 9, false, .09, .13, .20);
            TextRight(c, Money(detail.Subtotal), 542, y + 2, 9, true, .09, .13, .20);
            y -= 24;
        }

        if (details.Count == 0)
        {
            Text(c, "No existen líneas de detalle para esta orden de venta.", 52, y, 9, false, .39, .45, .55);
            y -= 24;
        }

        if (isLastPage)
        {
            var totalsTop = Math.Max(86d, y - 18);
            FillRect(c, 348, totalsTop - 78, 205, 86, .965, .975, .995);
            StrokeRect(c, 348, totalsTop - 78, 205, 86, .80, .85, .94, .8);
            Text(c, "Subtotal", 362, totalsTop - 12, 9, false, .39, .45, .55);
            TextRight(c, Money(invoice.Subtotal), 538, totalsTop - 12, 9.5, true, .09, .13, .20);
            Text(c, "IVA (15%)", 362, totalsTop - 35, 9, false, .39, .45, .55);
            TextRight(c, Money(invoice.Tax), 538, totalsTop - 35, 9.5, true, .09, .13, .20);
            DrawLine(c, 362, totalsTop - 48, 538, totalsTop - 48, .80, .85, .94, .7);
            Text(c, "TOTAL", 362, totalsTop - 67, 10.5, true, .145, .388, .922);
            TextRight(c, Money(invoice.Total), 538, totalsTop - 67, 13, true, .145, .388, .922);
        }

        // Pie de página.
        DrawLine(c, 42, 54, 553, 54, .87, .90, .94, .7);
        Text(c, "Documento generado por NorthWind · Clean Architecture", 42, 37, 7.5, false, .46, .52, .61);
        TextRight(c, $"Página {pageNumber} de {totalPages}", 553, 37, 7.5, false, .46, .52, .61);
        Text(c, "Documento informativo de la orden de venta registrada.", 42, 24, 7, false, .55, .60, .67);

        return Encoding.Latin1.GetBytes(c.ToString());
    }

    private static void DrawTableHeader(StringBuilder c, double y)
    {
        FillRect(c, 42, y - 16, 511, 24, .945, .960, .985);
        Text(c, "ID", 52, y - 1, 8, true, .27, .33, .42);
        Text(c, "PRODUCTO", 93, y - 1, 8, true, .27, .33, .42);
        TextRight(c, "CANT.", 382, y - 1, 8, true, .27, .33, .42);
        TextRight(c, "PRECIO", 470, y - 1, 8, true, .27, .33, .42);
        TextRight(c, "SUBTOTAL", 542, y - 1, 8, true, .27, .33, .42);
    }

    private static byte[] BuildDocument(IReadOnlyList<byte[]> streams)
    {
        var pageCount = streams.Count;
        var regularFontObject = 3 + pageCount * 2;
        var boldFontObject = regularFontObject + 1;
        var objectCount = boldFontObject;
        var objects = new byte[objectCount + 1][];

        objects[1] = Encoding.ASCII.GetBytes("<< /Type /Catalog /Pages 2 0 R >>");

        var kids = string.Join(" ", Enumerable.Range(0, pageCount).Select(i => $"{3 + i * 2} 0 R"));
        objects[2] = Encoding.ASCII.GetBytes($"<< /Type /Pages /Kids [{kids}] /Count {pageCount} >>");

        for (var i = 0; i < pageCount; i++)
        {
            var pageObject = 3 + i * 2;
            var contentObject = pageObject + 1;
            objects[pageObject] = Encoding.ASCII.GetBytes(
                $"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 {regularFontObject} 0 R /F2 {boldFontObject} 0 R >> >> /Contents {contentObject} 0 R >>");
            objects[contentObject] = Combine(
                Encoding.ASCII.GetBytes($"<< /Length {streams[i].Length} >>\nstream\n"),
                streams[i],
                Encoding.ASCII.GetBytes("\nendstream"));
        }

        objects[regularFontObject] = Encoding.ASCII.GetBytes("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
        objects[boldFontObject] = Encoding.ASCII.GetBytes("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");

        using var output = new MemoryStream();
        Write(output, "%PDF-1.4\n%NWPDF\n", Encoding.ASCII);
        var offsets = new long[objectCount + 1];

        for (var i = 1; i <= objectCount; i++)
        {
            offsets[i] = output.Position;
            Write(output, $"{i} 0 obj\n", Encoding.ASCII);
            output.Write(objects[i]);
            Write(output, "\nendobj\n", Encoding.ASCII);
        }

        var xrefPosition = output.Position;
        Write(output, $"xref\n0 {objectCount + 1}\n", Encoding.ASCII);
        Write(output, "0000000000 65535 f \n", Encoding.ASCII);
        for (var i = 1; i <= objectCount; i++)
        {
            Write(output, $"{offsets[i]:0000000000} 00000 n \n", Encoding.ASCII);
        }

        Write(output, $"trailer\n<< /Size {objectCount + 1} /Root 1 0 R >>\nstartxref\n{xrefPosition}\n%%EOF", Encoding.ASCII);
        return output.ToArray();
    }

    private static void Text(StringBuilder c, string value, double x, double y, double size, bool bold, double r, double g, double b)
    {
        c.Append(F(r)).Append(' ').Append(F(g)).Append(' ').Append(F(b)).Append(" rg\n");
        c.Append("BT /").Append(bold ? "F2" : "F1").Append(' ').Append(F(size)).Append(" Tf ")
            .Append(F(x)).Append(' ').Append(F(y)).Append(" Td (")
            .Append(Escape(value)).Append(") Tj ET\n");
    }

    private static void TextRight(StringBuilder c, string value, double rightX, double y, double size, bool bold, double r, double g, double b)
    {
        var estimatedWidth = value.Length * size * .50;
        Text(c, value, Math.Max(42, rightX - estimatedWidth), y, size, bold, r, g, b);
    }

    private static void FillRect(StringBuilder c, double x, double y, double width, double height, double r, double g, double b) =>
        c.Append("q ").Append(F(r)).Append(' ').Append(F(g)).Append(' ').Append(F(b)).Append(" rg ")
            .Append(F(x)).Append(' ').Append(F(y)).Append(' ').Append(F(width)).Append(' ').Append(F(height)).Append(" re f Q\n");

    private static void StrokeRect(StringBuilder c, double x, double y, double width, double height, double r, double g, double b, double lineWidth) =>
        c.Append("q ").Append(F(r)).Append(' ').Append(F(g)).Append(' ').Append(F(b)).Append(" RG ")
            .Append(F(lineWidth)).Append(" w ").Append(F(x)).Append(' ').Append(F(y)).Append(' ').Append(F(width)).Append(' ').Append(F(height)).Append(" re S Q\n");

    private static void DrawLine(StringBuilder c, double x1, double y1, double x2, double y2, double r, double g, double b, double lineWidth) =>
        c.Append("q ").Append(F(r)).Append(' ').Append(F(g)).Append(' ').Append(F(b)).Append(" RG ")
            .Append(F(lineWidth)).Append(" w ").Append(F(x1)).Append(' ').Append(F(y1)).Append(" m ")
            .Append(F(x2)).Append(' ').Append(F(y2)).Append(" l S Q\n");

    private static string Money(decimal value) => "$" + value.ToString("N2", CultureInfo.InvariantCulture);

    private static string Escape(string? value)
    {
        var safe = (value ?? string.Empty)
            .Replace("\\", "\\\\")
            .Replace("(", "\\(")
            .Replace(")", "\\)");
        return new string(safe.Select(ch => ch <= 255 ? ch : '?').ToArray());
    }

    private static string Truncate(string? value, int maxLength)
    {
        value ??= string.Empty;
        return value.Length <= maxLength ? value : value[..Math.Max(0, maxLength - 3)] + "...";
    }

    private static string F(double value) => value.ToString("0.###", CultureInfo.InvariantCulture);

    private static byte[] Combine(params byte[][] arrays)
    {
        var result = new byte[arrays.Sum(array => array.Length)];
        var offset = 0;
        foreach (var array in arrays)
        {
            Buffer.BlockCopy(array, 0, result, offset, array.Length);
            offset += array.Length;
        }
        return result;
    }

    private static void Write(Stream stream, string value, Encoding encoding)
    {
        var bytes = encoding.GetBytes(value);
        stream.Write(bytes, 0, bytes.Length);
    }
}
