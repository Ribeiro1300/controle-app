# Controle Pessoal (React Native + Expo)

App simples com 3 telas:

- Inicio
- Tarefas
- Perfil

## Rodar localmente

```powershell
npm install
npm run start
```

Depois, no terminal do Expo:

- pressione `a` para abrir no Android Emulator, ou
- escaneie o QR Code com o app Expo Go no celular.

## Gerar arquivo instalavel Android (APK)

1. Login no Expo:

```powershell
npx eas-cli login
```

2. Gerar build de preview (APK):

```powershell
npx eas-cli build --platform android --profile preview
```

3. Ao terminar, o EAS retorna um link para baixar o APK.

## Gerar build iOS

```powershell
npx eas-cli build --platform ios --profile production
```

Observacao:

- Build iOS exige conta Apple Developer para instalacao/distribuicao fora do simulador.

## Arquivos importantes

- `App.tsx`: navegacao e 3 telas
- `app.json`: metadados do app e identificadores Android/iOS
- `eas.json`: perfis de build (development, preview, production)
