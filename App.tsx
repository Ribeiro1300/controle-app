import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type RootStackParamList = {
  Inicio: undefined;
  Tarefas: undefined;
  Perfil: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type InicioProps = NativeStackScreenProps<RootStackParamList, 'Inicio'>;
type TarefasProps = NativeStackScreenProps<RootStackParamList, 'Tarefas'>;
type PerfilProps = NativeStackScreenProps<RootStackParamList, 'Perfil'>;

function InicioScreen({ navigation }: InicioProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minha Rotina</Text>
      <Text style={styles.subtitle}>App pessoal simples com 3 telas.</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Tarefas')}
      >
        <Text style={styles.buttonText}>Ir para Tarefas</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.buttonSecondary}
        onPress={() => navigation.navigate('Perfil')}
      >
        <Text style={styles.buttonSecondaryText}>Abrir Perfil</Text>
      </TouchableOpacity>
    </View>
  );
}

function TarefasScreen({ navigation }: TarefasProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tarefas de Hoje</Text>
      <Text style={styles.subtitle}>
        - Pagar contas{'\n'}- Treino{'\n'}- Estudar 30 min
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Perfil')}
      >
        <Text style={styles.buttonText}>Ver Perfil</Text>
      </TouchableOpacity>
    </View>
  );
}

function PerfilScreen({ navigation }: PerfilProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>
      <Text style={styles.subtitle}>Uso pessoal • React Native + Expo</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Inicio')}
      >
        <Text style={styles.buttonText}>Voltar ao Início</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Inicio"
        screenOptions={{
          headerStyle: { backgroundColor: '#0f172a' },
          headerTintColor: '#f8fafc',
          contentStyle: { backgroundColor: '#e2e8f0' },
        }}
      >
        <Stack.Screen
          name="Inicio"
          component={InicioScreen}
          options={{ title: 'Início' }}
        />
        <Stack.Screen name="Tarefas" component={TarefasScreen} />
        <Stack.Screen name="Perfil" component={PerfilScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#334155',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 10,
    minWidth: 180,
  },
  buttonText: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#cbd5e1',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 180,
  },
  buttonSecondaryText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
