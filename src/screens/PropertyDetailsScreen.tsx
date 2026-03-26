/**
 * Property Details Screen
 * Shows full details of a property
 */

import React, { useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Colors } from "../theme/colors";
import apiClient from "../services/ApiClient";
import type { GetPropertiesResponse, Property } from "../types/property";
import type { PropertiesStackParamList } from "../types/navigation";

type PropertyDetailsScreenProps = NativeStackScreenProps<
  PropertiesStackParamList,
  "PropertyDetails"
>;

export function PropertyDetailsScreen({ route, navigation }: PropertyDetailsScreenProps) {
  const { propertyId } = route.params;
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchPropertyDetails();
    }, [propertyId]),
  );

  useEffect(() => {
    fetchPropertyDetails();
  }, [propertyId]);

  async function fetchPropertyDetails() {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get<GetPropertiesResponse>(`/properties/${propertyId}`);

      if (response.result) {
        setProperty(response.result);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar detalhes";
      setError(errorMessage);
      console.error("Failed to fetch property details:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    try {
      setDeleting(true);
      // Soft delete - apenas marca como inativo
      await apiClient.put(`/properties/${propertyId}`, {
        is_active: false,
      });
      setShowDeleteConfirmation(false);
      navigation.goBack();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao excluir imóvel";
      console.error("Failed to delete property:", err);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.secondary} />
      </View>
    );
  }

  if (error || !property) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Erro: {error || "Imóvel não encontrado"}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isRented = property.tenantId !== null;
  const rentValue = parseFloat(property.rentValue).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  const estimatedValue = parseFloat(property.estimatedValue).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.propertyName}>{property.name}</Text>
          <View style={[styles.statusBadge, isRented ? styles.statusRented : styles.statusEmpty]}>
            <Text style={styles.statusText}>{isRented ? "Alugado" : "Vago"}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Localização</Text>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Endereço:</Text>
            <Text style={styles.value}>{property.address}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Número:</Text>
            <Text style={styles.value}>{property.number}</Text>
          </View>
          {property.complement && (
            <View style={styles.infoItem}>
              <Text style={styles.label}>Complemento:</Text>
              <Text style={styles.value}>{property.complement}</Text>
            </View>
          )}
          <View style={styles.infoItem}>
            <Text style={styles.label}>Cidade:</Text>
            <Text style={styles.value}>
              {property.city}, {property.state}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.label}>CEP:</Text>
            <Text style={styles.value}>{property.zipCode}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Valores</Text>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Valor Estimado:</Text>
            <Text style={styles.value}>{estimatedValue}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Valor do Aluguel:</Text>
            <Text style={[styles.value, styles.rentValueHighlight]}>{rentValue}</Text>
          </View>
          {property.dueDay && (
            <View style={styles.infoItem}>
              <Text style={styles.label}>Dia do Vencimento:</Text>
              <Text style={styles.value}>{property.dueDay}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inquilino</Text>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Nome:</Text>
            <Text style={styles.value}>
              {isRented ? `${property.tenant.name}` : "Sem inquilino"}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Telefone:</Text>
            <Text style={styles.value}>{isRented ? property.tenant.phone : "N/A"}</Text>
          </View>
          {isRented && property.tenant.observation && (
            <View style={styles.infoItem}>
              <Text style={styles.label}>Observações do Inquilino:</Text>
              <Text style={styles.value}>{property.tenant.observation}</Text>
            </View>
          )}
        </View>

        {property.observation && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observações</Text>
            <Text style={styles.observationText}>{property.observation}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Adicionais</Text>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{property.isActive ? "Ativo" : "Inativo"}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Criado em:</Text>
            <Text style={styles.value}>
              {new Date(property.createdAt).toLocaleDateString("pt-BR")}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Atualizado em:</Text>
            <Text style={styles.value}>
              {new Date(property.updatedAt).toLocaleDateString("pt-BR")}
            </Text>
          </View>
        </View>

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate("PropertyForm", { propertyId })}
          >
            <Text style={styles.editButtonText}>✏️ Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.deleteButton, deleting && styles.deleteButtonDisabled]}
            onPress={() => setShowDeleteConfirmation(true)}
            disabled={deleting}
          >
            <Text style={styles.deleteButtonText}>{deleting ? "Excluindo..." : "🗑️ Excluir"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showDeleteConfirmation}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirmation(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Excluir Imóvel</Text>
            <Text style={styles.modalMessage}>
              Tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita.
            </Text>

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowDeleteConfirmation(false)}
                disabled={deleting}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalConfirmButton, deleting && styles.modalConfirmButtonDisabled]}
                onPress={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator color={Colors.background} size="small" />
                ) : (
                  <Text style={styles.modalConfirmButtonText}>Excluir</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: Colors.secondary,
  },
  propertyName: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.primary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  statusRented: {
    backgroundColor: Colors.success,
  },
  statusEmpty: {
    backgroundColor: Colors.error,
  },
  statusText: {
    color: Colors.background,
    fontWeight: "600",
    fontSize: 12,
  },
  section: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 12,
  },
  infoItem: {
    marginBottom: 12,
    paddingVertical: 8,
  },
  label: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: "600",
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: "500",
  },
  rentValueHighlight: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  observationText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "400",
    lineHeight: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.background,
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondary,
  },
  backButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  backButtonText: {
    color: Colors.background,
    fontWeight: "600",
    fontSize: 14,
  },
  backButtonFull: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    marginVertical: 20,
    alignItems: "center",
  },
  backButtonTextFull: {
    color: Colors.background,
    fontWeight: "600",
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    fontWeight: "600",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    marginBottom: 32,
  },
  editButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  editButtonText: {
    color: Colors.background,
    fontWeight: "700",
    fontSize: 15,
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: Colors.error,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonDisabled: {
    backgroundColor: Colors.textLight,
    opacity: 0.6,
  },
  deleteButtonText: {
    color: Colors.background,
    fontWeight: "700",
    fontSize: 15,
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
