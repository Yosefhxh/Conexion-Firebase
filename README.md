# Conexción Firebase

Sistema de ejemplo construido con Expo y Firebase para autenticación, persistencia de sesión y operaciones CRUD sobre Firestore con aislamiento por usuario.

| Estado | Versión | Licencia |
| --- | --- | --- |
| Activo | Expo SDK 55 | MIT / uso académico |

## Índice

- Descripción del proyecto
- Evidencias de prueba
- Tecnologías utilizadas
- Instalación y configuración local
- Reglas de Firestore
- Guía de uso
- Estructura principal del proyecto
- Licencia

## Descripción del proyecto

Conexción Firebase es una aplicación móvil y web hecha con Expo SDK 55 y React Native. Su objetivo es demostrar un flujo completo de autenticación con Firebase Auth y manejo de datos en Cloud Firestore, manteniendo la información separada por usuario bajo la ruta `users/{uid}/items`.

La app usa AsyncStorage para conservar la sesión en dispositivos nativos cuando está disponible y mantiene compatibilidad con Expo Go, simulador o development build.

## Evidencias de prueba

Las evidencias de funcionamiento están incluidas en `assets/` y se muestran aquí para una revisión más clara.

### Resultado exitoso

<video controls width="100%" preload="metadata" src="assets/DevSuccesfull.mov"></video>

[Abrir video exitoso](assets/DevSuccesfull.mov)

### Resultado con error

<video controls width="100%" preload="metadata" src="assets/DevError.mov"></video>

[Abrir video de error](assets/DevError.mov)

Si tu visor de Markdown no reproduce el video incrustado, usa los enlaces directos de respaldo anteriores.

## Tecnologías utilizadas

- Expo SDK 55
- React Native 0.83
- Firebase Auth
- Cloud Firestore
- AsyncStorage
- JavaScript

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

### Pasos de instalación

1. Instala dependencias:

```bash
npm install
```

2. Inicia el proyecto:

```bash
npm start
```

3. Ejecuta la app según el entorno:

- Android: `npm run android`
- iOS: `npm run ios`
- Web: `npm run web`

Si necesitas limpiar la caché durante el desarrollo:

```bash
npx expo start -c
```

## Reglas de Firestore

Pega estas reglas en Firebase Console → Firestore → Rules para restringir el acceso por usuario:

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

Con esta configuración, cada usuario solo puede ver y modificar sus propios datos.

## Guía de uso

1. Abre la aplicación en Expo Go, un simulador o el navegador.
2. Inicia sesión con una cuenta válida de Firebase.
3. Usa la pantalla principal para crear, consultar, editar o eliminar registros.
4. Verifica que cada usuario solo vea su información en Firestore.

Si AsyncStorage está disponible, la sesión puede persistir entre aperturas en dispositivos nativos.

## Estructura principal del proyecto

- [src/config/firebase.js](src/config/firebase.js): inicialización de Firebase y Auth.
- [src/services/items.js](src/services/items.js): operaciones CRUD sobre Firestore.
- [src/screens/FirebaseAccessScreen.js](src/screens/FirebaseAccessScreen.js): pantalla principal de acceso y gestión.
- [firestore.rules](firestore.rules): reglas base de seguridad para Firestore.

## Licencia

Proyecto de ejemplo para uso académico y adaptación interna.
