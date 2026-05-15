/**
 * Payments Screen
 * Main screen for managing payments
 */

import React, { useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../theme/colors";
import apiClient from "../services/ApiClient";
import type { Payment, PaymentsResponse } from "../types/payment";
import type { PaymentsStackParamList } from "../types/navigation";

type PaymentsScreenProps = NativeStackScreenProps<PaymentsStackParamList, "PaymentsList">;

export function PaymentsScreen({ navigation }: PaymentsScreenProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"overdue" | "all">("overdue");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPaymentId, setDeletingPaymentId] = useState<number | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchPayments("overdue");
    }, []),
  );

  async function fetchPayments(status: "overdue" | "all") {
    try {
      setLoading(true);
      setError(null);

      if (status === "overdue") {
        const [overdueResponse, allResponse] = await Promise.all([
          apiClient.get<PaymentsResponse>("/payments?status=overdue"),
          apiClient.get<PaymentsResponse>("/payments"),
        ]);
        const overdueItems = overdueResponse.result ?? [];
        const partialItems = (allResponse.result ?? []).filter(
          (payment) => payment.status === "partial",
        );
        setPayments([...overdueItems, ...partialItems]);
      } else {
        const response = await apiClient.get<PaymentsResponse>("/payments");
        setPayments(response.result ?? []);
      }

      setFilterStatus(status);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar pagamentos";
      setError(errorMessage);
      console.error("Failed to fetch payments:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeletePayment() {
    if (!deletingPaymentId) return;

    try {
      setDeletingLoading(true);
      // Soft delete - apenas marca como inativo
      await apiClient.put(`/payments/${deletingPaymentId}`, {
        is_active: false,
      });
      setShowDeleteModal(false);
      setDeletingPaymentId(null);
      // Remove from list
      setPayments((prev) => prev.filter((payment) => payment.id !== deletingPaymentId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao excluir pagamento";
      console.error("Failed to delete payment:", err);
    } finally {
      setDeletingLoading(false);
    }
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "paid":
        return Colors.success;
      case "pending":
        return Colors.secondary;
      case "overdue":
        return Colors.error;
      case "partial":
        return Colors.warning;
      default:
        return Colors.textLight;
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "paid":
        return "Pago";
      case "pending":
        return "Pendente";
      case "overdue":
        return "Atrasado";
      case "partial":
        return "Parcial";
      default:
        return status;
    }
  };

  const formatCurrency = (value: number): string =>
    value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const renderPaymentCard = ({ item }: { item: Payment }) => {
    const paymentAmount = formatCurrency(item.amount);

    const statusColor = getStatusColor(item.status);
    const statusLabel = getStatusLabel(item.status);
    const isOverdue = item.status === "overdue";
    const isPartial = item.status === "partial";
    const isPaid = item.status === "paid";
    const isTappable = isOverdue || isPartial;

    const cardContent = (
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.propertyName}>{item.propertyName}</Text>
            <Text style={styles.monthYear}>
              {item.monthReference} {item.yearReference}
            </Text>
          </View>
          {isPaid && (
            <TouchableOpacity
              style={styles.deleteIconButton}
              onPress={() => {
                setDeletingPaymentId(item.id);
                setShowDeleteModal(true);
              }}
            >
              <Text style={styles.deleteIcon}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.cardFooter}>
          <View style={styles.amountContainer}>
            <Text style={isPartial ? styles.amountPartial : styles.amount}>{paymentAmount}</Text>
            {isPartial && <Text style={styles.amountSubLabel}>pago</Text>}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusLabel}>{statusLabel}</Text>
          </View>
        </View>
        {isPartial && typeof item.remainingAmount === "number" && (
          <View style={styles.remainingContainer}>
            <Text style={styles.remainingLabel}>Restante a pagar</Text>
            <Text style={styles.remainingAmount}>{formatCurrency(item.remainingAmount)}</Text>
          </View>
        )}
        {item.dueDay && <Text style={styles.dueDay}>Vencimento: dia {item.dueDay}</Text>}
        {isTappable && (
          <Text style={styles.tapHint}>
            {isPartial ? "Toque para quitar ou registrar outra parcela" : "Toque para registrar pagamento"}
          </Text>
        )}
      </View>
    );

    if (isTappable) {
      return (
        <TouchableOpacity
          style={[styles.paymentCard, isPartial && styles.paymentCardPartial]}
          onPress={() =>
            navigation.navigate("PaymentForm", {
              paymentData: {
                propertyId: item.propertyId,
                propertyName: item.propertyName,
                monthReference: item.monthReference,
                yearReference: item.yearReference,
                amount: isPartial && typeof item.remainingAmount === "number"
                  ? item.remainingAmount
                  : item.amount,
                isPartial,
                remainingAmount: item.remainingAmount,
              },
            })
          }
          activeOpacity={0.7}
        >
          {cardContent}
        </TouchableOpacity>
      );
    }

    return <View style={styles.paymentCard}>{cardContent}</View>;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.secondary} />
        <Text style={styles.loadingText}>Carregando pagamentos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Erro: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchPayments("overdue")}>
          <Text style={styles.retryButtonText}>↻ Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (payments.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.filterButtonsContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filterStatus === "overdue" && styles.filterButtonActive]}
            onPress={() => fetchPayments("overdue")}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterStatus === "overdue" && styles.filterButtonTextActive,
              ]}
            >
              Atrasados
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterStatus === "all" && styles.filterButtonActive]}
            onPress={() => fetchPayments("all")}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterStatus === "all" && styles.filterButtonTextActive,
              ]}
            >
              Todos
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.emptyText}>Nenhum pagamento registrado</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.title}>Pagamentos</Text>
            <Text style={styles.subtitle}>
              {filterStatus === "overdue"
                ? `${payments.length} pendente(s)`
                : `${payments.length} pagamento(s) registrado(s)`}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate("PaymentForm", {})}
          >
            <Text style={styles.registerButtonText}>+ Cadastrar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterButtonsContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filterStatus === "overdue" && styles.filterButtonActive]}
            onPress={() => fetchPayments("overdue")}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterStatus === "overdue" && styles.filterButtonTextActive,
              ]}
            >
              Atrasados
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterStatus === "all" && styles.filterButtonActive]}
            onPress={() => fetchPayments("all")}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterStatus === "all" && styles.filterButtonTextActive,
              ]}
            >
              Todos
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={payments}
          renderItem={renderPaymentCard}
          keyExtractor={(item, index) =>
            `${item.propertyName}-${item.monthReference}-${item.yearReference}-${index}`
          }
          scrollEnabled={true}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />

        <Modal
          visible={showDeleteModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDeleteModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.deleteModalContent}>
              <Text style={styles.deleteModalTitle}>Excluir Pagamento?</Text>
              <Text style={styles.deleteModalMessage}>
                Tem certeza que deseja excluir este pagamento? Esta ação não pode ser desfeita.
              </Text>
              <View style={styles.deleteModalButtons}>
                <TouchableOpacity
                  style={styles.deleteModalCancelButton}
                  onPress={() => setShowDeleteModal(false)}
                  disabled={deletingLoading}
                >
                  <Text style={styles.deleteModalCancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.deleteModalDeleteButton,
                    deletingLoading && styles.deleteModalDeleteButtonDisabled,
                  ]}
                  onPress={handleDeletePayment}
                  disabled={deletingLoading}
                >
                  {deletingLoading ? (
                    <ActivityIndicator color={Colors.background} />
                  ) : (
                    <Text style={styles.deleteModalDeleteButtonText}>Excluir</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
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
    paddingTop: 16,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.primary,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    fontWeight: "500",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.background,
    fontWeight: "600",
    fontSize: 14,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  paymentCard: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondary,
  },
  paymentCardPartial: {
    borderLeftColor: Colors.warning,
  },
  cardContent: {
    gap: 8,
  },
  propertyName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.background,
  },
  monthYear: {
    fontSize: 17,
    color: Colors.secondary,
    fontWeight: "700",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.background,
  },
  amountPartial: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.warning,
  },
  amountSubLabel: {
    fontSize: 11,
    color: Colors.background,
    fontWeight: "500",
    opacity: 0.7,
  },
  remainingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.15)",
  },
  remainingLabel: {
    fontSize: 12,
    color: Colors.background,
    fontWeight: "500",
  },
  remainingAmount: {
    fontSize: 15,
    color: Colors.warning,
    fontWeight: "700",
  },
  tapHint: {
    fontSize: 11,
    color: Colors.background,
    fontStyle: "italic",
    opacity: 0.6,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.background,
  },
  dueDay: {
    fontSize: 12,
    color: Colors.background,
    fontWeight: "400",
    marginTop: 4,
  },
  separator: {
    height: 8,
  },
  filterButtonsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  filterButtonActive: {
    backgroundColor: Colors.secondary,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.secondary,
  },
  filterButtonTextActive: {
    color: Colors.background,
  },
  registerButton: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  registerButtonText: {
    color: Colors.background,
    fontWeight: "700",
    fontSize: 13,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cardTitleContainer: {
    flex: 1,
  },
  deleteIconButton: {
    padding: 8,
    marginRight: -8,
  },
  deleteIcon: {
    fontSize: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteModalContent: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 24,
    width: "80%",
    alignItems: "center",
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 12,
  },
  deleteModalMessage: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  deleteModalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  deleteModalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.secondary,
    alignItems: "center",
  },
  deleteModalCancelButtonText: {
    color: Colors.secondary,
    fontWeight: "700",
    fontSize: 14,
  },
  deleteModalDeleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.error,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteModalDeleteButtonDisabled: {
    backgroundColor: Colors.textLight,
    opacity: 0.6,
  },
  deleteModalDeleteButtonText: {
    color: Colors.background,
    fontWeight: "700",
    fontSize: 14,
  },
});
