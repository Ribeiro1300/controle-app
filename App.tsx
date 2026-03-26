import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StyleSheet, Text } from "react-native";
import { PaymentsScreen } from "./src/screens/PaymentsScreen";
import { PropertiesScreen } from "./src/screens/PropertiesScreen";
import { PropertyDetailsScreen } from "./src/screens/PropertyDetailsScreen";
import { PropertyFormScreen } from "./src/screens/PropertyFormScreen";
import { DebtsScreen } from "./src/screens/DebtsScreen";
import { Colors } from "./src/theme/colors";
import type { RootTabParamList, PropertiesStackParamList } from "./src/types/navigation";

const Tab = createBottomTabNavigator<RootTabParamList>();
const PropertiesStack = createNativeStackNavigator<PropertiesStackParamList>();

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
          borderBottomWidth: 2,
          borderBottomColor: Colors.secondary,
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
            component={PaymentsScreen}
            options={{
              title: "Pagamentos",
              tabBarIcon: PaymentIcon,
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
            component={DebtsScreen}
            options={{
              title: "Débitos",
              tabBarIcon: DebtIcon,
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
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
