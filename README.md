# Conexción Firebase

Aplicación Expo + React Native para autenticación con Firebase Auth y operaciones CRUD sobre Firestore con datos aislados por usuario.

## Índice

- Descripción del proyecto
- Tecnologías utilizadas
- Evidencias de pruebas
- Instalación y configuración local
- Firestore y reglas de seguridad
- Guía de uso
- Estructura principal del proyecto
- Licencia

## Descripción del proyecto

Conexción Firebase es una app de ejemplo construida con Expo SDK 55 que permite iniciar sesión con Firebase Authentication y administrar registros en Firestore. La información se guarda por usuario bajo la ruta `users/{uid}/items`, de modo que cada cuenta solo trabaja con su propio contenido.

La app usa AsyncStorage para mantener la sesión en dispositivos nativos cuando está disponible y conserva una experiencia compatible con Expo Go o development build.

## Tecnologías utilizadas

- Expo SDK 55
- React Native 0.83
- Firebase Auth
- Cloud Firestore
- AsyncStorage
- JavaScript

## Evidencias de pruebas

Las pruebas de funcionamiento exitoso y de fallo están disponibles en la carpeta `assets/`:

- [Prueba exitosa](assets/DevSuccesfull.mov)
- [Prueba de error](assets/DevError.mov)

Estas evidencias muestran el comportamiento esperado de la aplicación durante el flujo de desarrollo.

## Instalación y configuración local

### Requisitos

- Node.js
- npm o yarn
- Cuenta y proyecto en Firebase

### Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con estas variables:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Pasos

1. Instala dependencias:

```bash
npm install
```

2. Inicia Expo:

```bash
npm start
```

3. Abre la app según tu entorno:

- Android: `npm run android`
- iOS: `npm run ios`
- Web: `npm run web`

Si necesitas limpiar la caché durante el desarrollo, puedes usar:

```bash
npx expo start -c
```

## Firestore y reglas de seguridad

Pega estas reglas en Firebase Console → Firestore → Rules para restringir el acceso a cada usuario:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/items/{itemId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false;
    }
  }
}
```

Con esta configuración, cada usuario solo puede leer y modificar sus propios registros.

## Guía de uso

1. Abre la aplicación en Expo Go, un simulador o el navegador.
2. Inicia sesión con una cuenta válida de Firebase.
3. Usa la pantalla principal para crear, consultar, editar o eliminar registros.
4. Verifica que la información quede separada por usuario en Firestore.

Si AsyncStorage está disponible, la sesión puede persistir entre aperturas en dispositivos nativos.

## Estructura principal del proyecto

- [src/config/firebase.js](src/config/firebase.js): inicialización de Firebase y Auth.
- [src/services/items.js](src/services/items.js): operaciones CRUD sobre Firestore.
- [src/screens/FirebaseAccessScreen.js](src/screens/FirebaseAccessScreen.js): pantalla principal de acceso y gestión.
- [firestore.rules](firestore.rules): reglas base de seguridad para Firestore.

## Licencia

Proyecto de ejemplo. Puedes usarlo y adaptarlo según tus necesidades.
