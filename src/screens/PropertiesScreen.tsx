/**
 * Properties Screen
 * Screen for managing properties
 */

import React, { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../theme/colors";
import apiClient from "../services/ApiClient";
import type { Property, PropertiesResponse } from "../types/property";
import type { PropertiesStackParamList } from "../types/navigation";

type PropertiesScreenProps = NativeStackScreenProps<PropertiesStackParamList, "PropertiesList">;

export function PropertiesScreen({ navigation }: PropertiesScreenProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      fetchProperties();
    }, []),
  );

  async function fetchProperties() {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get<PropertiesResponse>("/properties");

      if (response?.result) {
        setProperties(response.result);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar imóveis";
      setError(errorMessage);
      console.error("Failed to fetch properties:", err);
    } finally {
      setLoading(false);
    }
  }

  const renderPropertyCard = ({ item }: { item: Property }) => {
    const isRented = item.tenantId !== null;
    const rentValue = parseFloat(item.rentValue).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    return (
      <TouchableOpacity
        style={[styles.card, isRented ? styles.cardRented : styles.cardEmpty]}
        onPress={() => navigation.navigate("PropertyDetails", { propertyId: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <View style={[styles.badge, isRented ? styles.rentedBadge : styles.emptyBadge]}>
            <Text style={styles.badgeText}>{isRented ? "Alugado" : "Vago"}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Endereço:</Text>
            <Text style={styles.value}>
              {item.address}, {item.number}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Cidade:</Text>
            <Text style={styles.value}>
              {item.city}, {item.state}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.rentInfoRow}>
            <View>
              <Text style={styles.rentLabel}>Valor do Aluguel</Text>
              <Text style={styles.rentValue}>{rentValue}</Text>
            </View>
            <View style={styles.tenantInfo}>
              <Text style={styles.rentLabel}>Inquilino</Text>
              <Text style={styles.tenantId}>{isRented ? `${item.tenant.name}` : "Nenhum"}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.secondary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Erro: {error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Imóveis</Text>
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate("PropertyForm", {})}
          >
            <Text style={styles.registerButtonText}>+ Cadastrar</Text>
          </TouchableOpacity>
        </View>

        {properties.length > 0 ? (
          <FlatList
            data={properties}
            renderItem={renderPropertyCard}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.center}>
            <Text style={styles.emptyText}>Nenhum imóvel cadastrado</Text>
          </View>
        )}
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
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.primary,
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
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardRented: {
    borderColor: Colors.border,
  },
  cardEmpty: {
    borderColor: Colors.error,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.background,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  rentedBadge: {
    backgroundColor: Colors.success,
  },
  emptyBadge: {
    backgroundColor: Colors.error,
  },
  badgeText: {
    color: Colors.background,
    fontSize: 12,
    fontWeight: "600",
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  infoRow: {
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: "500",
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  rentInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rentLabel: {
    fontSize: 11,
    color: Colors.textLight,
    fontWeight: "500",
    marginBottom: 4,
  },
  rentValue: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "700",
  },
  tenantInfo: {
    alignItems: "flex-end",
  },
  tenantId: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    fontWeight: "500",
  },
});
