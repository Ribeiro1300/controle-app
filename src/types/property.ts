/**
 * Property type definition
 */

export interface Property {
  id: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  name: string;
  address: string;
  number: string;
  complement: string | null;
  city: string;
  state: string;
  zipCode: string;
  dueDay: number | null;
  estimatedValue: string;
  rentValue: string;
  observation: string | null;
  tenantId: number | null;
  tenant: Tenant;
}

export interface Tenant {
  id: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  name: string;
  phone: string;
  observation: string;
}

export interface PropertiesResponse {
  result: Property[];
  message: string;
}

export interface GetPropertiesResponse {
  result: Property;
  message: string;
}
