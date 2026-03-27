/**
 * Payment type definition
 */

export interface Payment {
  id: number;
  propertyId: number;
  propertyName: string;
  monthReference: string;
  yearReference: number;
  amount: number;
  dueDay: string;
  status: "paid" | "pending" | "overdue";
}

export interface PaymentsResponse {
  result: Payment[];
  message: string;
}
