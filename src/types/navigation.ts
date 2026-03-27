/**
 * Navigation type definitions
 */

export type RootTabParamList = {
  Payments: undefined;
  Properties: undefined;
  Debts: undefined;
};

export type PropertiesStackParamList = {
  PropertiesList: undefined;
  PropertyDetails: { propertyId: number };
  PropertyForm: { propertyId?: number };
};

export type PaymentsStackParamList = {
  PaymentsList: undefined;
  PaymentForm: {
    paymentData?: {
      propertyId: number;
      propertyName: string;
      monthReference: string;
      yearReference: number;
      amount: number;
    };
  };
};

export type DebtsStackParamList = {
  DebtsList: undefined;
  ExpenseForm: { expenseId?: number };
};
