/**
 * Expense type definition
 */

export interface Expense {
  id: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  propertyId: number;
  property: Property;
  amount: string;
  debtDate: string;
  observation: string | null;
}

export interface Property {
  id: number;
  name: string;
  address: string;
}

export interface ExpensesResponse {
  result: Expense[];
  message: string;
}

export interface GetExpenseResponse {
  result: Expense;
  message: string;
}
