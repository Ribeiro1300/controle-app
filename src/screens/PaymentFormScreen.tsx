/**
 * Payment Form Screen
 * Form for creating payments
 */

import React, { useState, useEffect } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Colors } from "../theme/colors";
import apiClient from "../services/ApiClient";
import type { Property, PropertiesResponse } from "../types/property";
import type { PaymentsStackParamList } from "../types/navigation";

type PaymentFormScreenProps = NativeStackScreenProps<PaymentsStackParamList, "PaymentForm">;

interface FormData {
  paymentDate: string;
  yearReference: number;
  amount: string;
  propertyId: number | null;
  monthReference: string;
  observation: string;
}

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const INITIAL_FORM_STATE: FormData = {
  paymentDate: new Date().toISOString().split("T")[0],
  yearReference: new Date().getFullYear(),
  amount: "",
  propertyId: null,
  monthReference: MONTHS[new Date().getMonth()],
  observation: "",
};

// Convert date format from YYYY-MM-DD to DD-MM-AAAA
function convertDateToBrazilian(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${day}-${month}-${year}`;
}

// Convert date format from DD-MM-AAAA to YYYY-MM-DD
function convertDateToISO(dateStr: string): string {
  const [day, month, year] = dateStr.split("-");
  return `${year}-${month}-${day}`;
}

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

export function PaymentFormScreen({ navigation, route }: PaymentFormScreenProps) {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_STATE);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load properties on mount
  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoadingProperties(true);
        const response = await apiClient.get<PropertiesResponse>("/properties");
        if (response.result) {
          setProperties(response.result);

          // If coming from a payment, pre-fill form data
          if (route.params?.paymentData) {
            const { propertyId, propertyName, monthReference, yearReference, amount } =
              route.params.paymentData;

            setFormData((prev) => ({
              ...prev,
              propertyId,
              monthReference,
              yearReference,
              amount: amount.toString(),
            }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch properties:", err);
      } finally {
        setLoadingProperties(false);
      }
    };

    loadProperties();
  }, [route.params?.paymentData]);

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    let finalValue: string | number = value;

    if (field === "amount") {
      finalValue = formatMoneyInput(value as string);
    } else if (field === "paymentDate") {
      // Allow any input but validate format separately
      finalValue = value as string;
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

    if (!formData.paymentDate.trim()) {
      newErrors.paymentDate = "Data é obrigatória";
    }
    if (!formData.yearReference) {
      newErrors.yearReference = "Ano é obrigatório";
    }
    if (!formData.propertyId) {
      newErrors.propertyId = "Imóvel é obrigatório";
    }
    if (!formData.amount.trim()) {
      newErrors.amount = "Valor é obrigatório";
    }
    if (!formData.monthReference) {
      newErrors.monthReference = "Mês é obrigatório";
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

      const payload = {
        payment_date: formData.paymentDate,
        year_reference: formData.yearReference,
        amount: parseFloat(formData.amount),
        property_id: formData.propertyId,
        month_reference: formData.monthReference,
        ...(formData.observation && { observation: formData.observation }),
      };

      await apiClient.post("/payments", payload);
      navigation.goBack();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao salvar pagamento";
      console.error("Failed to save payment:", err);
      setErrors((prev) => ({ ...prev, submit: errorMessage }));
    } finally {
      setLoading(false);
    }
  };

  const selectedProperty = properties.find((p) => p.id === formData.propertyId);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAwareScrollView
        style={styles.container}
        contentContainerStyle={styles.containerContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={30}
        extraHeight={140}
        keyboardOpeningTime={0}
      >
        <Text style={styles.sectionTitle}>Informações do Pagamento</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Data do Pagamento *</Text>
          <TextInput
            style={[styles.input, errors.paymentDate && styles.inputError]}
            placeholder={convertDateToBrazilian(new Date().toISOString().split("T")[0])}
            value={convertDateToBrazilian(formData.paymentDate)}
            onChangeText={(value) => {
              const isoDate = convertDateToISO(value);
              handleInputChange("paymentDate", isoDate);
            }}
            placeholderTextColor={Colors.textLight}
          />
          {errors.paymentDate && <Text style={styles.errorText}>{errors.paymentDate}</Text>}
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, styles.flex]}>
            <Text style={styles.label}>Ano *</Text>
            <TextInput
              style={[styles.input, errors.yearReference && styles.inputError]}
              placeholder="2026"
              value={formData.yearReference.toString()}
              onChangeText={(value) => handleInputChange("yearReference", parseInt(value) || 0)}
              keyboardType="number-pad"
              placeholderTextColor={Colors.textLight}
            />
            {errors.yearReference && <Text style={styles.errorText}>{errors.yearReference}</Text>}
          </View>

          <View style={[styles.formGroup, styles.flex]}>
            <Text style={styles.label}>Mês *</Text>
            <TouchableOpacity
              style={[styles.selectButton, errors.monthReference && styles.inputError]}
              onPress={() => setShowMonthDropdown(true)}
            >
              <Text style={styles.selectButtonText}>{formData.monthReference}</Text>
            </TouchableOpacity>
            {errors.monthReference && <Text style={styles.errorText}>{errors.monthReference}</Text>}
          </View>
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
          <Text style={styles.label}>Observações</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Adicione observações (opcional)"
            value={formData.observation}
            onChangeText={(value) => handleInputChange("observation", value)}
            placeholderTextColor={Colors.textLight}
            multiline
            numberOfLines={4}
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
                        const rentAmount = parseFloat(item.rentValue);
                        const formattedAmount = rentAmount.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        });
                        setFormData((prev) => ({
                          ...prev,
                          propertyId: item.id,
                          amount: formattedAmount.replace(",", "."),
                        }));
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

        <Modal
          visible={showMonthDropdown}
          transparent
          animationType="slide"
          onRequestClose={() => setShowMonthDropdown(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Selecione um Mês</Text>
                <TouchableOpacity onPress={() => setShowMonthDropdown(false)}>
                  <Text style={styles.modalCloseButton}>✕</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={MONTHS}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.monthOption,
                      formData.monthReference === item && styles.monthOptionSelected,
                    ]}
                    onPress={() => {
                      setFormData((prev) => ({ ...prev, monthReference: item }));
                      setShowMonthDropdown(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.monthOptionText,
                        formData.monthReference === item && styles.monthOptionTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item}
                scrollEnabled={true}
              />
            </View>
          </View>
        </Modal>
      </KeyboardAwareScrollView>
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
  },
  containerContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 120,
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
  row: {
    flexDirection: "row",
    gap: 12,
  },
  flex: {
    flex: 1,
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
  textArea: {
    paddingVertical: 12,
    textAlignVertical: "top",
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
  monthOption: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  monthOptionSelected: {
    backgroundColor: Colors.secondary + "20",
  },
  monthOptionText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  monthOptionTextSelected: {
    color: Colors.secondary,
    fontWeight: "700",
  },
});
