/**
 * Expenses Screen
 * Screen for managing expenses/gastos
 */

import React, { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../theme/colors";
import apiClient from "../services/ApiClient";
import type { Expense, ExpensesResponse } from "../types/expense";
import type { DebtsStackParamList } from "../types/navigation";

type DebtsScreenProps = NativeStackScreenProps<DebtsStackParamList, "DebtsList">;

export function DebtsScreen({ navigation }: DebtsScreenProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingExpenseId, setDeletingExpenseId] = useState<number | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchExpenses();
    }, []),
  );

  async function fetchExpenses() {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<ExpensesResponse>("/debts");
      if (response.result) {
        setExpenses(response.result);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar gastos";
      setError(errorMessage);
      console.error("Failed to fetch expenses:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteExpense() {
    if (!deletingExpenseId) return;

    try {
      setDeletingLoading(true);
      // Soft delete - apenas marca como inativo
      await apiClient.put(`/debts/${deletingExpenseId}`, {
        is_active: false,
      });
      setShowDeleteModal(false);
      setDeletingExpenseId(null);
      // Remove from list
      setExpenses((prev) => prev.filter((expense) => expense.id !== deletingExpenseId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao excluir gasto";
      console.error("Failed to delete expense:", err);
    } finally {
      setDeletingLoading(false);
    }
  }

  // Get current month expenses
  const getCurrentMonthExpenses = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.debtDate);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });
  };

  const currentMonthExpenses = getCurrentMonthExpenses();

  const renderExpenseCard = ({ item }: { item: Expense }) => {
    const expenseAmount = parseFloat(item.amount).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    const expenseDate = new Date(item.debtDate).toLocaleDateString("pt-BR");

    return (
      <View style={styles.expenseCard}>
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.propertyName}>{item.property?.name || "Imóvel desconhecido"}</Text>
            <TouchableOpacity
              style={styles.deleteIconButton}
              onPress={() => {
                setDeletingExpenseId(item.id);
                setShowDeleteModal(true);
              }}
            >
              <Text style={styles.deleteIcon}>🗑️</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.amount}>{expenseAmount}</Text>
            <Text style={styles.date}>{expenseDate}</Text>
          </View>
          {item.observation && <Text style={styles.observation}>{item.observation}</Text>}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.secondary} />
        <Text style={styles.loadingText}>Carregando gastos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Erro: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchExpenses}>
          <Text style={styles.retryButtonText}>↻ Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (currentMonthExpenses.length === 0 && expenses.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Gastos</Text>
          <Text style={styles.subtitle}>0 gasto(s) registrado(s) este mês</Text>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>Nenhum gasto registrado</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("ExpenseForm", {})}
          >
            <Text style={styles.addButtonText}>➕ Adicionar Gasto</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Gastos</Text>
          <Text style={styles.subtitle}>
            {currentMonthExpenses.length} gasto(s) registrado(s) este mês
          </Text>
        </View>

        <View style={styles.listWrapper}>
          <FlatList
            data={expenses}
            renderItem={renderExpenseCard}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.listContainer}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("ExpenseForm", {})}
          >
            <Text style={styles.addButtonText}>➕ Adicionar Gasto</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Excluir Gasto</Text>
            <Text style={styles.modalMessage}>
              Tem certeza que deseja excluir este gasto? Esta ação não pode ser desfeita.
            </Text>

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowDeleteModal(false)}
                disabled={deletingLoading}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalConfirmButton,
                  deletingLoading && styles.modalConfirmButtonDisabled,
                ]}
                onPress={handleDeleteExpense}
                disabled={deletingLoading}
              >
                {deletingLoading ? (
                  <ActivityIndicator color={Colors.background} size="small" />
                ) : (
                  <Text style={styles.modalConfirmButtonText}>Excluir</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  header: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: Colors.secondary,
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
  expenseCard: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondary,
  },
  cardContent: {
    gap: 6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deleteIconButton: {
    padding: 4,
  },
  deleteIcon: {
    fontSize: 18,
  },
  propertyName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.background,
  },
  description: {
    fontSize: 13,
    color: Colors.textLight,
    fontWeight: "500",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.secondary,
  },
  date: {
    fontSize: 16,
    color: Colors.textLight,
    fontWeight: "500",
  },
  observation: {
    fontSize: 15,
    color: Colors.background,
    fontWeight: "400",
    marginTop: 8,
    lineHeight: 18,
    fontStyle: "italic",
  },
  listWrapper: {
    flex: 1,
    paddingBottom: 16,
  },
  addButton: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    paddingVertical: 14,
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: Colors.background,
    fontWeight: "700",
    fontSize: 15,
  },
  separator: {
    height: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 14,
    color: Colors.primary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.border,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelButtonText: {
    color: Colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.error,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  modalConfirmButtonDisabled: {
    backgroundColor: Colors.textLight,
    opacity: 0.6,
  },
  modalConfirmButtonText: {
    color: Colors.background,
    fontWeight: "600",
    fontSize: 14,
  },
});
