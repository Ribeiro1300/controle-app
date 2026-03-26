/**
 * Debts Screen
 * Screen for managing debts
 */

import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../theme/colors";

export function DebtsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Débitos</Text>
      <Text style={styles.subtitle}>Gerencie seus débitos aqui</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
  },
});
