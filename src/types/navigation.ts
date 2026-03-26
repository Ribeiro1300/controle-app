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
};
