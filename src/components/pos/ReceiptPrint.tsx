import { forwardRef } from "react";

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
}

interface ReceiptData {
  orderNumber: number;
  date: Date;
  items: ReceiptItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
  paymentMethod: string;
  tableName?: string;
  restaurantName: string;
  restaurantAddress?: string;
  restaurantPhone?: string;
}

interface ReceiptPrintProps {
  data: ReceiptData;
}

const paymentMethodLabels: Record<string, string> = {
  cash: "Espèces",
  card: "Carte bancaire",
  mobile_money: "Mobile Money",
};

export const ReceiptPrint = forwardRef<HTMLDivElement, ReceiptPrintProps>(
  ({ data }, ref) => {
    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(date);
    };

    return (
      <div
        ref={ref}
        className="receipt-print bg-white text-black p-4 font-mono text-sm"
        style={{
          width: "80mm",
          maxWidth: "80mm",
          minWidth: "80mm",
        }}
      >
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-lg font-bold uppercase">{data.restaurantName}</h1>
          {data.restaurantAddress && (
            <p className="text-xs">{data.restaurantAddress}</p>
          )}
          {data.restaurantPhone && (
            <p className="text-xs">Tél: {data.restaurantPhone}</p>
          )}
        </div>

        {/* Separator */}
        <div className="border-t border-dashed border-black my-2" />

        {/* Order Info */}
        <div className="mb-3">
          <div className="flex justify-between">
            <span>Ticket N°:</span>
            <span className="font-bold">#{data.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{formatDate(data.date)}</span>
          </div>
          {data.tableName && (
            <div className="flex justify-between">
              <span>Table:</span>
              <span>{data.tableName}</span>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="border-t border-dashed border-black my-2" />

        {/* Items */}
        <div className="mb-3">
          <div className="flex justify-between text-xs font-bold mb-1">
            <span className="flex-1">Article</span>
            <span className="w-10 text-center">Qté</span>
            <span className="w-20 text-right">Prix</span>
          </div>
          {data.items.map((item, index) => (
            <div key={index} className="flex justify-between text-xs py-0.5">
              <span className="flex-1 truncate pr-2">{item.name}</span>
              <span className="w-10 text-center">{item.quantity}</span>
              <span className="w-20 text-right">
                {(item.price * item.quantity).toLocaleString("fr-FR")}
              </span>
            </div>
          ))}
        </div>

        {/* Separator */}
        <div className="border-t border-dashed border-black my-2" />

        {/* Totals */}
        <div className="mb-3 text-xs">
          <div className="flex justify-between">
            <span>Sous-total:</span>
            <span>{data.subtotal.toLocaleString("fr-FR")} CFA</span>
          </div>
          {data.discountPercent > 0 && (
            <div className="flex justify-between">
              <span>Remise ({data.discountPercent}%):</span>
              <span>-{data.discountAmount.toLocaleString("fr-FR")} CFA</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t border-black">
            <span>TOTAL:</span>
            <span>{data.total.toLocaleString("fr-FR")} CFA</span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="text-center text-xs mb-3">
          <p>
            Payé par:{" "}
            <span className="font-bold">
              {paymentMethodLabels[data.paymentMethod] || data.paymentMethod}
            </span>
          </p>
        </div>

        {/* Separator */}
        <div className="border-t border-dashed border-black my-2" />

        {/* Footer */}
        <div className="text-center text-xs">
          <p className="font-bold">Merci de votre visite !</p>
          <p className="mt-1">À bientôt</p>
        </div>

        {/* Print styles */}
        <style>{`
          @media print {
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body * {
              visibility: hidden;
            }
            .receipt-print,
            .receipt-print * {
              visibility: visible;
            }
            .receipt-print {
              position: absolute;
              left: 0;
              top: 0;
              width: 80mm !important;
              padding: 5mm !important;
              font-size: 12px !important;
            }
          }
        `}</style>
      </div>
    );
  }
);

ReceiptPrint.displayName = "ReceiptPrint";
