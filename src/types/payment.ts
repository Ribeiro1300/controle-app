/**
 * Payment type definition
 */

export type PaymentStatus = "paid" | "pending" | "overdue" | "partial";

export interface Payment {
  id: number;
  propertyId: number;
  propertyName: string;
  monthReference: string;
  yearReference: number;
  amount: number;
  dueDay: string;
  status: PaymentStatus;
  remainingAmount?: number;
}

export interface PaymentsResponse {
  result: Payment[];
  message: string;
}
