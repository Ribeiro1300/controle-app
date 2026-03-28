/**
 * Property Form Screen
 * Form for creating and editing properties
 */

import React, { useState, useEffect } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../theme/colors";
import apiClient from "../services/ApiClient";
import type { GetPropertiesResponse, Property } from "../types/property";
import type { PropertiesStackParamList } from "../types/navigation";

type PropertyFormScreenProps = NativeStackScreenProps<PropertiesStackParamList, "PropertyForm">;

const INITIAL_FORM_STATE: Omit<Property, "id" | "createdAt" | "updatedAt"> = {
  isActive: true,
  name: "",
  address: "",
  number: "",
  complement: null,
  city: "",
  state: "",
  zipCode: "",
  dueDay: null,
  estimatedValue: "",
  rentValue: "",
  observation: null,
  tenantId: null,
  tenant: {
    id: 0,
    isActive: true,
    createdAt: "",
    updatedAt: "",
    name: "",
    phone: "",
    observation: "",
  },
};

interface TenantFormData {
  tenantName: string;
  tenantPhone: string;
  tenantObservation: string;
}

const INITIAL_TENANT_STATE: TenantFormData = {
  tenantName: "",
  tenantPhone: "",
  tenantObservation: "",
};

// Convert snake_case object to camelCase (for API responses)
function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((v) => toCamelCase(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = toCamelCase(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
}

// Convert camelCase object to snake_case
function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((v) => toSnakeCase(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      result[snakeKey] = toSnakeCase(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
}

// Format money input to allow only digits and up to 2 decimal places
function formatMoneyInput(value: string): string {
  // Remove non-numeric characters except the decimal separator
  let formatted = value.replace(/[^0-9,]/g, "");

  // Replace comma with dot for storage
  formatted = formatted.replace(",", ".");

  // Limit to 2 decimal places
  const parts = formatted.split(".");
  if (parts.length > 2) {
    formatted = parts[0] + "." + parts[1].substring(0, 2);
  } else if (parts.length === 2 && parts[1].length > 2) {
    formatted = parts[0] + "." + parts[1].substring(0, 2);
  }

  return formatted;
}

export function PropertyFormScreen({ navigation, route }: PropertyFormScreenProps) {
  const isEditing = route.params?.propertyId !== undefined;
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [tenantData, setTenantData] = useState<TenantFormData>(INITIAL_TENANT_STATE);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tenantErrors, setTenantErrors] = useState<Record<string, string>>({});

  // Load property data when in edit mode
  useEffect(() => {
    if (isEditing && route.params?.propertyId) {
      const loadProperty = async () => {
        try {
          setInitialLoading(true);
          const response = await apiClient.get<GetPropertiesResponse>(
            `/properties/${route.params?.propertyId}`,
          );
          const property = toCamelCase(response.result);

          setFormData({
            isActive: property.isActive ?? true,
            name: property.name ?? "",
            address: property.address ?? "",
            number: property.number ?? "",
            complement: property.complement ?? null,
            city: property.city ?? "",
            state: property.state ?? "",
            zipCode: property.zipCode ?? "",
            dueDay: property.dueDay ?? null,
            estimatedValue: property.estimatedValue?.toString() ?? "",
            rentValue: property.rentValue?.toString() ?? "",
            observation: property.observation ?? null,
            tenantId: property.tenantId ?? null,
            tenant: property.tenant ?? {
              id: 0,
              isActive: true,
              createdAt: "",
              updatedAt: "",
              name: "",
              phone: "",
              observation: "",
            },
          });

          // Populate tenant fields if tenant exists
          if (property.tenant) {
            setTenantData({
              tenantName: property.tenant.name ?? "",
              tenantPhone: property.tenant.phone ?? "",
              tenantObservation: property.tenant.observation ?? "",
            });
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Erro ao carregar imóvel";
          Alert.alert("Erro", errorMessage);
          console.error("Failed to load property:", err);
          navigation.goBack();
        } finally {
          setInitialLoading(false);
        }
      };

      loadProperty();
    }
  }, [isEditing, route.params?.propertyId, navigation]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    // Apply money formatting for currency fields
    let finalValue = value;
    if (field === "estimatedValue" || field === "rentValue") {
      finalValue = formatMoneyInput(value);
    }

    setFormData((prev) => ({
      ...prev,
      [field]: finalValue,
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleTenantInputChange = (field: keyof TenantFormData, value: string) => {
    setTenantData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user starts typing
    if (tenantErrors[field]) {
      setTenantErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome do imóvel é obrigatório";
    }
    if (!formData.address.trim()) {
      newErrors.address = "Endereço é obrigatório";
    }
    if (!formData.number.trim()) {
      newErrors.number = "Número é obrigatório";
    }
    if (!formData.city.trim()) {
      newErrors.city = "Cidade é obrigatória";
    }
    if (!formData.state.trim()) {
      newErrors.state = "Estado é obrigatório";
    }
    if (!formData.rentValue.trim()) {
      newErrors.rentValue = "Valor do aluguel é obrigatório";
    }
    if (!formData.estimatedValue.trim()) {
      newErrors.estimatedValue = "Valor estimado é obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert("Validação", "Por favor, preencha todos os campos obrigatórios");
      return;
    }

    try {
      setLoading(true);

      // Prepare data for API
      const payload: any = {
        ...formData,
        dueDay: formData.dueDay ? formData.dueDay.toString() : null,
      };

      // Add tenant data if provided
      if (tenantData.tenantName.trim() || tenantData.tenantPhone.trim()) {
        payload.tenant_info = {
          name: tenantData.tenantName,
          phone: tenantData.tenantPhone,
          observation: tenantData.tenantObservation,
        };
      }

      // Convert to snake_case
      const snakeCasePayload = toSnakeCase(payload);

      if (isEditing) {
        await apiClient.put(`/properties/${route.params?.propertyId}`, snakeCasePayload);
        Alert.alert("Sucesso", "Imóvel atualizado com sucesso!");
      } else {
        await apiClient.post("/properties", snakeCasePayload);
        Alert.alert("Sucesso", "Imóvel cadastrado com sucesso!");
      }

      navigation.goBack();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao salvar imóvel";
      Alert.alert("Erro", errorMessage);
      console.error("Failed to save property:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {initialLoading ? (
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color={Colors.secondary} />
          <Text style={styles.loadingText}>Carregando imóvel...</Text>
        </View>
      ) : (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Informações Básicas</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nome do Imóvel *</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Ex: Casa de Praia"
              value={formData.name}
              onChangeText={(value) => handleInputChange("name", value)}
              placeholderTextColor={Colors.textLight}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          <Text style={styles.sectionTitle}>Localização</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Endereço *</Text>
            <TextInput
              style={[styles.input, errors.address && styles.inputError]}
              placeholder="Ex: Rua das Flores"
              value={formData.address}
              onChangeText={(value) => handleInputChange("address", value)}
              placeholderTextColor={Colors.textLight}
            />
            {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, styles.flex]}>
              <Text style={styles.label}>Número *</Text>
              <TextInput
                style={[styles.input, errors.number && styles.inputError]}
                placeholder="123"
                value={formData.number}
                onChangeText={(value) => handleInputChange("number", value)}
                placeholderTextColor={Colors.textLight}
              />
              {errors.number && <Text style={styles.errorText}>{errors.number}</Text>}
            </View>

            <View style={[styles.formGroup, styles.flex]}>
              <Text style={styles.label}>Complemento</Text>
              <TextInput
                style={styles.input}
                placeholder="Apto 42"
                value={formData.complement || ""}
                onChangeText={(value) => handleInputChange("complement", value)}
                placeholderTextColor={Colors.textLight}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, styles.flex]}>
              <Text style={styles.label}>Cidade *</Text>
              <TextInput
                style={[styles.input, errors.city && styles.inputError]}
                placeholder="São Paulo"
                value={formData.city}
                onChangeText={(value) => handleInputChange("city", value)}
                placeholderTextColor={Colors.textLight}
              />
              {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
            </View>

            <View style={[styles.formGroup, styles.flex]}>
              <Text style={styles.label}>Estado *</Text>
              <TextInput
                style={[styles.input, errors.state && styles.inputError]}
                placeholder="SP"
                value={formData.state}
                onChangeText={(value) => handleInputChange("state", value)}
                maxLength={2}
                placeholderTextColor={Colors.textLight}
              />
              {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>CEP</Text>
            <TextInput
              style={[styles.input, errors.zipCode && styles.inputError]}
              placeholder="12345-680"
              value={formData.zipCode}
              onChangeText={(value) => handleInputChange("zipCode", value)}
              placeholderTextColor={Colors.textLight}
            />
            {errors.zipCode && <Text style={styles.errorText}>{errors.zipCode}</Text>}
          </View>

          <Text style={styles.sectionTitle}>Valores</Text>

          <View style={styles.row}>
            <View style={[styles.formGroup, styles.flex]}>
              <Text style={styles.label}>Valor Estimado (R$) *</Text>
              <TextInput
                style={[styles.input, errors.estimatedValue && styles.inputError]}
                placeholder="100000,00"
                value={formData.estimatedValue}
                onChangeText={(value) => handleInputChange("estimatedValue", value)}
                keyboardType="decimal-pad"
                placeholderTextColor={Colors.textLight}
              />
              {errors.estimatedValue && (
                <Text style={styles.errorText}>{errors.estimatedValue}</Text>
              )}
            </View>

            <View style={[styles.formGroup, styles.flex]}>
              <Text style={styles.label}>Valor Aluguel (R$) *</Text>
              <TextInput
                style={[styles.input, errors.rentValue && styles.inputError]}
                placeholder="2000,00"
                value={formData.rentValue}
                onChangeText={(value) => handleInputChange("rentValue", value)}
                keyboardType="decimal-pad"
                placeholderTextColor={Colors.textLight}
              />
              {errors.rentValue && <Text style={styles.errorText}>{errors.rentValue}</Text>}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Dia do Vencimento</Text>
            <TextInput
              style={styles.input}
              placeholder="5 (dia do mês)"
              value={formData.dueDay?.toString() || ""}
              onChangeText={(value) => handleInputChange("dueDay", value)}
              keyboardType="number-pad"
              maxLength={2}
              placeholderTextColor={Colors.textLight}
            />
          </View>

          <Text style={styles.sectionTitle}>Informações Adicionais</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Observações</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Adicione notas sobre o imóvel..."
              value={formData.observation || ""}
              onChangeText={(value) => handleInputChange("observation", value)}
              multiline
              numberOfLines={4}
              placeholderTextColor={Colors.textLight}
              textAlignVertical="top"
            />
          </View>

          <Text style={styles.sectionTitle}>Dados do Inquilino</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nome do Inquilino</Text>
            <TextInput
              style={[styles.input, tenantErrors.tenantName && styles.inputError]}
              placeholder="Ex: João Silva"
              value={tenantData.tenantName}
              onChangeText={(value) => handleTenantInputChange("tenantName", value)}
              placeholderTextColor={Colors.textLight}
            />
            {tenantErrors.tenantName && (
              <Text style={styles.errorText}>{tenantErrors.tenantName}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: (11) 9999-9999"
              value={tenantData.tenantPhone}
              onChangeText={(value) => handleTenantInputChange("tenantPhone", value)}
              keyboardType="phone-pad"
              placeholderTextColor={Colors.textLight}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Observações do Inquilino</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Adicione notas sobre o inquilino..."
              value={tenantData.tenantObservation}
              onChangeText={(value) => handleTenantInputChange("tenantObservation", value)}
              multiline
              numberOfLines={4}
              placeholderTextColor={Colors.textLight}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.background} />
              ) : (
                <Text style={styles.submitButtonText}>{isEditing ? "Atualizar" : "Cadastrar"}</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 120,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: Colors.primary,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
    marginTop: 20,
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: Colors.secondary,
    paddingBottom: 8,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.primary,
    backgroundColor: Colors.background,
  },
  inputError: {
    borderColor: Colors.error,
    borderWidth: 2,
  },
  textArea: {
    minHeight: 100,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    marginBottom: 32,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.secondary,
    alignItems: "center",
  },
  cancelButtonText: {
    color: Colors.secondary,
    fontWeight: "700",
    fontSize: 15,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: Colors.textLight,
  },
  submitButtonText: {
    color: Colors.background,
    fontWeight: "700",
    fontSize: 15,
  },
});
