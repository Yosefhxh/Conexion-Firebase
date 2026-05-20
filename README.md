**Conexción Firebase**

Proyecto de ejemplo en Expo + React Native que demuestra autenticación con Firebase Auth y operaciones CRUD en Firestore por usuario.

**Características**
- Autenticación con correo/contraseña (Firebase Auth).
- Persistencia de sesión (AsyncStorage) cuando está disponible.
- CRUD en Firestore bajo la ruta `users/{uid}/items`.
- Compatible con Expo SDK 55 (dev: Expo Go o development build).

**Requisitos**
- Node.js
- npm o yarn
- Expo CLI (opcional: `npx expo` funciona sin instalación global)
- Cuenta y proyecto en Firebase

**Variables de entorno**
Define en el fichero `.env` (ya incluido en `.gitignore`):

- EXPO_PUBLIC_FIREBASE_API_KEY
- EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
- EXPO_PUBLIC_FIREBASE_PROJECT_ID
- EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
- EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- EXPO_PUBLIC_FIREBASE_APP_ID

Ejemplo (no compartir claves públicas en repositorios públicos):

EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key

**Instalación y ejecución**
1. Instala dependencias:

```bash
npm install
```

2. Inicia Expo (limpia caché si es necesario):

```bash
npx expo start -c
```

3. Abre en dispositivo con Expo Go (asegúrate de tener la versión compatible con SDK 55), o usa el simulador:

- iOS: presiona `i` en la interfaz de Expo o `npx expo start --ios`
- Android: presiona `a` o `npx expo start --android`

**Firestore — reglas recomendadas (desarrollo/producción básica)**
Pega estas reglas en Firebase Console → Firestore → Rules:

```
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

Esto permite que cada usuario solo acceda a sus propios `items`.

**Archivos clave**
- [src/config/firebase.js](src/config/firebase.js): inicialización de Firebase y Auth (usa `initializeAuth` con `AsyncStorage` si está disponible).
- [src/services/items.js](src/services/items.js): funciones CRUD sobre `users/{uid}/items`.
- [src/screens/FirebaseAccessScreen.js](src/screens/FirebaseAccessScreen.js): pantalla principal de autenticación y CRUD.
- `.env`: variables públicas de Firebase (no subir al repo).

**Notas y troubleshooting**
- Si ves "Project is incompatible with this version of Expo Go", actualiza Expo Go en tu dispositivo o crea un development build con EAS.
- Si aparece "Missing or insufficient permissions", revisa las reglas de Firestore y que el `projectId` en `.env` coincida con el proyecto de Firebase.
- Advertencia sobre persistencia: la app intenta usar `@react-native-async-storage/async-storage` para persistir sesión; si no está disponible, la sesión se mantendrá solo en memoria.

**Licencia**
Proyecto de ejemplo — usa y adapta libremente.
