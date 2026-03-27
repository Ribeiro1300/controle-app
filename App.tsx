import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StyleSheet, Text } from "react-native";
import { PaymentsScreen } from "./src/screens/PaymentsScreen";
import { PaymentFormScreen } from "./src/screens/PaymentFormScreen";
import { PropertiesScreen } from "./src/screens/PropertiesScreen";
import { PropertyDetailsScreen } from "./src/screens/PropertyDetailsScreen";
import { PropertyFormScreen } from "./src/screens/PropertyFormScreen";
import { DebtsScreen } from "./src/screens/DebtsScreen";
import { ExpenseFormScreen } from "./src/screens/ExpenseFormScreen";
import { Colors } from "./src/theme/colors";
import type {
  RootTabParamList,
  PropertiesStackParamList,
  PaymentsStackParamList,
  DebtsStackParamList,
} from "./src/types/navigation";

const Tab = createBottomTabNavigator<RootTabParamList>();
const PropertiesStack = createNativeStackNavigator<PropertiesStackParamList>();
const PaymentsStack = createNativeStackNavigator<PaymentsStackParamList>();
const DebtsStack = createNativeStackNavigator<DebtsStackParamList>();

// Icon components for tabs
function PaymentIcon({ color }: { color: string }) {
  return <Text style={{ color, fontSize: 24 }}>💳</Text>;
}

function PropertyIcon({ color }: { color: string }) {
  return <Text style={{ color, fontSize: 24 }}>🏠</Text>;
}

function DebtIcon({ color }: { color: string }) {
  return <Text style={{ color, fontSize: 24 }}>📊</Text>;
}

// Stack Navigator for Properties
function PropertiesStackNavigator() {
  return (
    <PropertiesStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.background,
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
        },
      }}
    >
      <PropertiesStack.Screen
        name="PropertiesList"
        component={PropertiesScreen}
        options={{
          title: "Imóveis",
          headerShown: false,
        }}
      />
      <PropertiesStack.Screen
        name="PropertyDetails"
        component={PropertyDetailsScreen}
        options={{
          title: "Detalhes do Imóvel",
        }}
      />
      <PropertiesStack.Screen
        name="PropertyForm"
        component={PropertyFormScreen}
        options={{
          title: "Cadastro de Imóvel",
        }}
      />
    </PropertiesStack.Navigator>
  );
}

// Stack Navigator for Payments
function PaymentsStackNavigator() {
  return (
    <PaymentsStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.background,
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
        },
      }}
    >
      <PaymentsStack.Screen
        name="PaymentsList"
        component={PaymentsScreen}
        options={{
          title: "Pagamentos",
          headerShown: false,
        }}
      />
      <PaymentsStack.Screen
        name="PaymentForm"
        component={PaymentFormScreen}
        options={{
          title: "Cadastro de Pagamento",
        }}
      />
    </PaymentsStack.Navigator>
  );
}

// Stack Navigator for Debts/Expenses
function DebtsStackNavigator() {
  return (
    <DebtsStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.background,
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
        },
      }}
    >
      <DebtsStack.Screen
        name="DebtsList"
        component={DebtsScreen}
        options={{
          title: "Gastos",
          headerShown: false,
        }}
      />
      <DebtsStack.Screen
        name="ExpenseForm"
        component={ExpenseFormScreen}
        options={{
          title: "Cadastro de Gasto",
        }}
      />
    </DebtsStack.Navigator>
  );
}

export default function App() {
  return (
    <>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: Colors.primary,
              borderBottomWidth: 2,
              borderBottomColor: Colors.secondary,
            },
            headerTintColor: Colors.background,
            headerTitleStyle: {
              fontWeight: "700",
              fontSize: 18,
            },
            tabBarStyle: {
              backgroundColor: Colors.primary,
              borderTopWidth: 2,
              borderTopColor: Colors.secondary,
              paddingBottom: 8,
              paddingTop: 8,
              height: 60,
            },
            tabBarActiveTintColor: Colors.secondary,
            tabBarInactiveTintColor: Colors.textLight,
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: "600",
              marginTop: 4,
            },
          }}
        >
          <Tab.Screen
            name="Payments"
            component={PaymentsStackNavigator}
            options={{
              title: "Pagamentos",
              tabBarIcon: PaymentIcon,
              headerShown: false,
            }}
          />
          <Tab.Screen
            name="Properties"
            component={PropertiesStackNavigator}
            options={{
              title: "Imóveis",
              tabBarIcon: PropertyIcon,
              headerShown: false,
            }}
          />
          <Tab.Screen
            name="Debts"
            component={DebtsStackNavigator}
            options={{
              title: "Gastos",
              tabBarIcon: DebtIcon,
              headerShown: false,
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
      <StatusBar backgroundColor={Colors.primary} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
});
