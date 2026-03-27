/**
 * Expense Form Screen
 * Form for creating and editing expenses/gastos
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
  Modal,
  FlatList,
} from "react-native";
import { Colors } from "../theme/colors";
import apiClient from "../services/ApiClient";
import type { Property, PropertiesResponse } from "../types/property";
import type { DebtsStackParamList } from "../types/navigation";

type ExpenseFormScreenProps = NativeStackScreenProps<DebtsStackParamList, "ExpenseForm">;

interface FormData {
  debtDate: string;
  propertyId: number | null;
  amount: string;
  observation: string;
}

const INITIAL_FORM_STATE: FormData = {
  debtDate: new Date().toISOString().split("T")[0],
  propertyId: null,
  amount: "",
  observation: "",
};

// Format money input to allow only digits and up to 2 decimal places
function formatMoneyInput(value: string): string {
  let formatted = value.replace(/[^0-9,]/g, "");
  formatted = formatted.replace(",", ".");

  const parts = formatted.split(".");
  if (parts.length > 2) {
    formatted = parts[0] + "." + parts[1].substring(0, 2);
  } else if (parts.length === 2 && parts[1].length > 2) {
    formatted = parts[0] + "." + parts[1].substring(0, 2);
  }

  return formatted;
}

export function ExpenseFormScreen({ navigation, route }: ExpenseFormScreenProps) {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_STATE);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load properties on mount
  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoadingProperties(true);
        const response = await apiClient.get<PropertiesResponse>("/properties");
        if (response.result) {
          setProperties(response.result);
        }
      } catch (err) {
        console.error("Failed to fetch properties:", err);
      } finally {
        setLoadingProperties(false);
      }
    };

    loadProperties();
  }, []);

  const handleInputChange = (field: keyof FormData, value: string) => {
    let finalValue: string | number | null = value;

    if (field === "amount") {
      finalValue = formatMoneyInput(value);
    }

    setFormData((prev) => ({
      ...prev,
      [field]: finalValue,
    }));

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.debtDate.trim()) {
      newErrors.debtDate = "Data é obrigatória";
    }
    if (!formData.propertyId) {
      newErrors.propertyId = "Imóvel é obrigatório";
    }
    if (!formData.amount.trim()) {
      newErrors.amount = "Valor é obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Format the date with current time
      const [year, month, day] = formData.debtDate.split("-");
      const now = new Date();
      const debtDatetime = `${year}-${month}-${day} ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}.${now.getMilliseconds().toString().padStart(3, "0")}`;

      const payload = {
        debt_date: debtDatetime,
        property_id: formData.propertyId,
        amount: parseFloat(formData.amount),
        observation: formData.observation || "",
      };

      await apiClient.post("/debts", payload);
      navigation.goBack();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao salvar gasto";
      console.error("Failed to save expense:", err);
      setErrors((prev) => ({ ...prev, submit: errorMessage }));
    } finally {
      setLoading(false);
    }
  };

  const selectedProperty = properties.find((p) => p.id === formData.propertyId);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Informações do Gasto</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Data *</Text>
        <TextInput
          style={[styles.input, errors.debtDate && styles.inputError]}
          placeholder="DD-MM-AAAA"
          value={formData.debtDate}
          onChangeText={(value) => handleInputChange("debtDate", value)}
          placeholderTextColor={Colors.textLight}
        />
        {errors.debtDate && <Text style={styles.errorText}>{errors.debtDate}</Text>}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Imóvel *</Text>
        <TouchableOpacity
          style={[styles.selectButton, errors.propertyId && styles.inputError]}
          onPress={() => setShowPropertyDropdown(true)}
        >
          <Text style={[styles.selectButtonText, !selectedProperty && styles.placeholderText]}>
            {selectedProperty ? selectedProperty.name : "Selecione um imóvel"}
          </Text>
        </TouchableOpacity>
        {errors.propertyId && <Text style={styles.errorText}>{errors.propertyId}</Text>}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Valor (R$) *</Text>
        <TextInput
          style={[styles.input, errors.amount && styles.inputError]}
          placeholder="0,00"
          value={formData.amount}
          onChangeText={(value) => handleInputChange("amount", value)}
          keyboardType="decimal-pad"
          placeholderTextColor={Colors.textLight}
        />
        {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Observação</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Adicione notas sobre o gasto..."
          value={formData.observation}
          onChangeText={(value) => handleInputChange("observation", value)}
          multiline
          numberOfLines={4}
          placeholderTextColor={Colors.textLight}
          textAlignVertical="top"
        />
      </View>

      {errors.submit && <Text style={styles.submitError}>{errors.submit}</Text>}

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
            <Text style={styles.submitButtonText}>Cadastrar</Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={showPropertyDropdown}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPropertyDropdown(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione um Imóvel</Text>
              <TouchableOpacity onPress={() => setShowPropertyDropdown(false)}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {loadingProperties ? (
              <View style={styles.centerContent}>
                <ActivityIndicator size="large" color={Colors.secondary} />
              </View>
            ) : (
              <FlatList
                data={properties}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.propertyOption,
                      formData.propertyId === item.id && styles.propertyOptionSelected,
                    ]}
                    onPress={() => {
                      setFormData((prev) => ({ ...prev, propertyId: item.id }));
                      setShowPropertyDropdown(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.propertyOptionText,
                        formData.propertyId === item.id && styles.propertyOptionTextSelected,
                      ]}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={true}
              />
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 16,
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
  selectButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: "center",
    backgroundColor: Colors.background,
  },
  selectButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  placeholderText: {
    color: Colors.textLight,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },
  submitError: {
    color: Colors.error,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.error + "20",
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: Colors.error,
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
    opacity: 0.6,
  },
  submitButtonText: {
    color: Colors.background,
    fontWeight: "700",
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
  },
  modalCloseButton: {
    fontSize: 24,
    color: Colors.textLight,
    fontWeight: "600",
  },
  centerContent: {
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 150,
  },
  propertyOption: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  propertyOptionSelected: {
    backgroundColor: Colors.secondary + "20",
  },
  propertyOptionText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  propertyOptionTextSelected: {
    color: Colors.secondary,
    fontWeight: "700",
  },
});
