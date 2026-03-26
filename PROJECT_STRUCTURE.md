# Controle Front - Mobile App

Aplicativo mobile com React Native e Expo para gerenciamento de pagamentos, imóveis e débitos.

## 📋 Estrutura do Projeto

```
controle-front/
├── src/
│   ├── screens/           # Telas da aplicação
│   │   ├── PaymentsScreen.tsx    # Tela de Pagamentos (principal)
│   │   ├── PropertiesScreen.tsx  # Tela de Imóveis
│   │   └── DebtsScreen.tsx       # Tela de Débitos
│   ├── services/          # Serviços e integrações
│   │   └── ApiClient.ts   # Cliente HTTP para requisições
│   ├── theme/             # Configurações de tema
│   │   └── colors.ts      # Paleta de cores (Preto e Vermelho - Flamengo)
│   └── types/             # Tipos TypeScript
│       └── navigation.ts   # Tipos de navegação
├── assets/                # Imagens, ícones e outros recursos
├── App.tsx                # Componente raiz da aplicação
├── app.json               # Configuração do Expo
├── package.json           # Dependências do projeto
└── tsconfig.json          # Configuração do TypeScript
```

## 🎨 Tema (Flamengo)

- **Preto (Primary)**: `#1a1a1a`
- **Vermelho (Secondary)**: `#e60000`
- **Branco (Background)**: `#ffffff`
- **Texto**: `#1a1a1a`
- **Texto claro**: `#666666`

## 🚀 Como Usar

### 1. Instalar Dependências

```bash
npm install
```

### 2. Executar o Aplicativo

```bash
# Iniciar previewer
npm start

# Executar no Android
npm run android

# Executar no iOS
npm run ios

# Executar na Web
npm run web
```

### 3. Build

```bash
# Build para Android
npm run build:android

# Build para iOS
npm run build:ios
```

## 📱 Navegação

O aplicativo utiliza **Bottom Tabs Navigator** com 3 abas principais:

1. **Pagamentos** (💳) - Tela principal
2. **Imóveis** (🏠) - Gerenciamento de propriedades
3. **Débitos** (📊) - Controle de débitos

## 🔌 API Client

Uso do serviço `ApiClient` para requisições:

```typescript
import apiClient from "./src/services/ApiClient";

// GET
const data = await apiClient.get<DataType>("/endpoint");

// POST
const result = await apiClient.post<ResponseType>("/endpoint", { data });

// PUT
const updated = await apiClient.put<ResponseType>("/endpoint", { data });

// DELETE
const deleted = await apiClient.delete<ResponseType>("/endpoint");

// PATCH
const patched = await apiClient.patch<ResponseType>("/endpoint", { data });
```

## 📝 Código Limpo

O projeto segue princípios de código limpo:

- ✅ Componentes responsáveis por uma única coisa
- ✅ Nomes descritivos e em inglês
- ✅ Separação de responsabilidades (screens, services, theme)
- ✅ Tipos TypeScript para segurança
- ✅ Estilos organizados com `StyleSheet`

## 🛠️ Tecnologias

- **React Native** - Framework mobile
- **Expo** - Plataforma de desenvolvimento
- **TypeScript** - Tipagem estática
- **React Navigation** - Navegação entre telas
- **Bottom Tabs Navigator** - Abas de navegação

## 📄 Licença

MIT
