import { IInvoice, IInvoiceItem } from "../../@types/types";
import { expectId } from "./helperTestFunctions.test";


export function expectInvoice(invoice : IInvoice){
    expectId(invoice.orderId);
    expectId(invoice.userId);
    expectId(invoice._id);
    expect(typeof invoice.grandTotal).toBe("number");
    expect(typeof invoice.subTotal).toBe("number");
    expect(typeof invoice.pdfLink).toBe("string");
    expect(typeof invoice.hostedLink).toBe("string");
    expect(invoice.pdfLink.length).toBeGreaterThan(0);
    expect(invoice.hostedLink.length).toBeGreaterThan(0);
    expect(invoice.updatedAt).toBeTruthy();
    expect(invoice.createdAt).toBeTruthy();
    expect(invoice.invoiceItems.length).toBeGreaterThanOrEqual(1);
    invoice.invoiceItems.forEach((invoiceItem)=>{
        expectInvoiceItem(invoiceItem);
    })
}

export function expectInvoiceItem(invoiceItem : IInvoiceItem){
    expectId(invoiceItem._id);
    expectId(invoiceItem.productId);
    expect(typeof invoiceItem.unitPrice).toBe("number");
    expect(typeof invoiceItem.quantity).toBe("number");
    expect(invoiceItem.quantity).toBeGreaterThanOrEqual(1);
}