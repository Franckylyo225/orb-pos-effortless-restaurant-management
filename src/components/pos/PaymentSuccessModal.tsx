import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, Printer, X } from "lucide-react";
import { ReceiptPrint } from "./ReceiptPrint";

interface PaymentSuccessModalProps {
  open: boolean;
  onClose: () => void;
  orderNumber: number;
  total: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  paymentMethod: string;
  tableName?: string;
  restaurantName: string;
  restaurantAddress?: string;
  restaurantPhone?: string;
}

export function PaymentSuccessModal({
  open,
  onClose,
  orderNumber,
  total,
  items,
  subtotal,
  discountPercent,
  discountAmount,
  paymentMethod,
  tableName,
  restaurantName,
  restaurantAddress,
  restaurantPhone,
}: PaymentSuccessModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reçu #${orderNumber}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Courier New', Courier, monospace;
              font-size: 12px;
              width: 80mm;
              padding: 5mm;
              background: white;
              color: black;
            }
            .receipt-header {
              text-align: center;
              margin-bottom: 10px;
            }
            .receipt-header h1 {
              font-size: 16px;
              font-weight: bold;
              text-transform: uppercase;
              margin-bottom: 5px;
            }
            .receipt-header p {
              font-size: 10px;
            }
            .separator {
              border-top: 1px dashed #000;
              margin: 8px 0;
            }
            .order-info {
              margin-bottom: 10px;
            }
            .order-info div {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2px;
            }
            .items-header {
              display: flex;
              justify-content: space-between;
              font-weight: bold;
              font-size: 10px;
              margin-bottom: 5px;
            }
            .item {
              display: flex;
              justify-content: space-between;
              font-size: 10px;
              padding: 2px 0;
            }
            .item-name {
              flex: 1;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              padding-right: 5px;
            }
            .item-qty {
              width: 30px;
              text-align: center;
            }
            .item-price {
              width: 60px;
              text-align: right;
            }
            .totals {
              margin: 10px 0;
              font-size: 10px;
            }
            .totals div {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2px;
            }
            .total-line {
              font-weight: bold;
              font-size: 14px;
              margin-top: 8px;
              padding-top: 8px;
              border-top: 1px solid #000;
            }
            .payment-method {
              text-align: center;
              font-size: 10px;
              margin: 10px 0;
            }
            .footer {
              text-align: center;
              font-size: 10px;
            }
            .footer p {
              margin: 3px 0;
            }
            @media print {
              @page {
                size: 80mm auto;
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt-header">
            <h1>${restaurantName}</h1>
            ${restaurantAddress ? `<p>${restaurantAddress}</p>` : ""}
            ${restaurantPhone ? `<p>Tél: ${restaurantPhone}</p>` : ""}
          </div>
          
          <div class="separator"></div>
          
          <div class="order-info">
            <div><span>Ticket N°:</span><span><strong>#${orderNumber}</strong></span></div>
            <div><span>Date:</span><span>${new Date().toLocaleString("fr-FR")}</span></div>
            ${tableName ? `<div><span>Table:</span><span>${tableName}</span></div>` : ""}
          </div>
          
          <div class="separator"></div>
          
          <div class="items-header">
            <span class="item-name">Article</span>
            <span class="item-qty">Qté</span>
            <span class="item-price">Prix</span>
          </div>
          
          ${items
            .map(
              (item) => `
            <div class="item">
              <span class="item-name">${item.name}</span>
              <span class="item-qty">${item.quantity}</span>
              <span class="item-price">${(item.price * item.quantity).toLocaleString("fr-FR")}</span>
            </div>
          `
            )
            .join("")}
          
          <div class="separator"></div>
          
          <div class="totals">
            <div><span>Sous-total:</span><span>${subtotal.toLocaleString("fr-FR")} CFA</span></div>
            ${
              discountPercent > 0
                ? `<div><span>Remise (${discountPercent}%):</span><span>-${discountAmount.toLocaleString("fr-FR")} CFA</span></div>`
                : ""
            }
            <div class="total-line"><span>TOTAL:</span><span>${total.toLocaleString("fr-FR")} CFA</span></div>
          </div>
          
          <div class="payment-method">
            Payé par: <strong>${
              paymentMethod === "cash"
                ? "Espèces"
                : paymentMethod === "card"
                ? "Carte bancaire"
                : paymentMethod === "mobile_money"
                ? "Mobile Money"
                : paymentMethod
            }</strong>
          </div>
          
          <div class="separator"></div>
          
          <div class="footer">
            <p><strong>Merci de votre visite !</strong></p>
            <p>À bientôt</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-accent-success">
            <CheckCircle className="h-6 w-6" />
            Paiement réussi
          </DialogTitle>
        </DialogHeader>

        <div className="text-center py-4">
          <p className="text-muted-foreground mb-2">Commande #{orderNumber}</p>
          <p className="text-3xl font-bold text-primary">
            {total.toLocaleString("fr-FR")} CFA
          </p>
        </div>

        {/* Hidden receipt for reference */}
        <div className="hidden">
          <ReceiptPrint
            ref={receiptRef}
            data={{
              orderNumber,
              date: new Date(),
              items,
              subtotal,
              discountPercent,
              discountAmount,
              total,
              paymentMethod,
              tableName,
              restaurantName,
              restaurantAddress,
              restaurantPhone,
            }}
          />
        </div>

        <div className="flex gap-3 mt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            <X className="h-4 w-4 mr-2" />
            Fermer
          </Button>
          <Button onClick={handlePrint} className="flex-1">
            <Printer className="h-4 w-4 mr-2" />
            Imprimer le reçu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
