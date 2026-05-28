# Conexión Firebase 🚀

Sistema de demostración profesional construido con **Expo** y **Firebase** que implementa flujos avanzados de autenticación, persistencia de sesión robusta y operaciones CRUD en **Cloud Firestore** con aislamiento estricto por usuario a nivel de base de datos.

| Estado | Versión | Licencia |
| --- | --- | --- |
| 🟢 Activo | Expo SDK 55 (React Native 0.83) | MIT / Uso Académico |

---

## 📋 Índice

- [Descripción del Proyecto](#-descripción-del-proyecto)
- [🧪 Prueba de Dependencias (SCA)](#-prueba-de-dependencias-sca)
- [🛠️ Tecnologías Utilizadas](#️-tecnologías-utilizadas)
- [⚙️ Instalación y Configuración Local](#️-instalación-y-configuración-local)
- [🔒 Reglas de Seguridad de Firestore](#-reglas-de-seguridad-de-firestore)
- [📖 Guía de Uso](#-guía-de-uso)
- [📂 Estructura Principal del Proyecto](#-estructura-principal-del-proyecto)
- [📄 Licencia](#-licencia)

---

## 📝 Descripción del Proyecto

**Conexión Firebase** es una aplicación móvil y web multiplataforma desarrollada bajo el entorno de **Expo SDK 55**. El propósito fundamental de este desarrollo es servir como una arquitectura de referencia para:

1. **Autenticación Centralizada:** Flujo completo de inicio de sesión, registro y cierre de sesión utilizando *Firebase Auth*.
2. **Seguridad y Aislamiento de Datos:** Arquitectura multi-inquilino (*multi-tenant*) lógica donde cada usuario autenticado opera de manera aislada bajo la ruta jerárquica `users/{uid}/items`.
3. **Persistencia de Sesión:** Integración híbrida que aprovecha *AsyncStorage* para mantener el estado de la sesión activo en dispositivos nativos (iOS/Android), garantizando una excelente experiencia de usuario (UX) sin re-autenticaciones forzadas.

El proyecto mantiene total compatibilidad con **Expo Go**, emuladores/simuladores locales y *development builds*.

---

## 🧪 Prueba de Dependencias (SCA)

Esta validación se realizó para demostrar el comportamiento del pipeline de seguridad ante una dependencia vulnerable y su posterior remediación, sin modificar el flujo de trabajo de CI/CD.

### PARTE 1: Cómo forzar el FALLO (Línea base insegura - Color ROJO)

Se instaló intencionalmente una librería obsoleta con vulnerabilidades críticas/altas para forzar el fallo del paso de auditoría SCA.

Comando ejecutado:

```bash
npm install lodash@4.17.11
```

Publicación del cambio:

```bash
git add package.json package-lock.json
git commit -m "test: forzar fallo de seguridad en dependencias (SCA)"
git push origin main
```

Resultado esperado en GitHub Actions:

- El pipeline avanza hasta el paso de auditoría de dependencias.
- `npm audit` detecta vulnerabilidades críticas en la versión instalada.
- El proceso se bloquea con código de error y estado final en rojo.

### PARTE 2: Cómo hacer que PASE (Línea base segura - Color VERDE)

Para remediar el problema y restaurar la línea base segura, se eliminó la dependencia vulnerable.

Comando ejecutado:

```bash
npm uninstall lodash
```

Publicación del cambio de remediación:

```bash
git add package.json package-lock.json
git commit -m "fix: eliminar dependencia vulnerable y restaurar entorno seguro"
git push origin main
```

Resultado esperado en GitHub Actions:

- `npm audit` ya no reporta vulnerabilidades críticas de esa dependencia.
- El pipeline completa sus validaciones de seguridad de forma exitosa.
- Estado final en verde.

---

## 🛠️ Tecnologías Utilizadas

- **Framework Principal:** [Expo SDK 55](https://expo.dev/) & [React Native 0.83](https://reactnative.dev/)
- **Backend as a Service (BaaS):** [Firebase](https://firebase.google.com/)
  - **Autenticación:** Firebase Authentication (Manejo de tokens y estado de sesión)
  - **Base de Datos:** Cloud Firestore (NoSQL optimizado para tiempo real)
- **Almacenamiento Local:** `@react-native-async-storage/async-storage`
- **Lenguaje Base:** JavaScript (ES6+)

---

## ⚙️ Instalación y Configuración Local

### Requisitos Previos

Asegúrate de contar con el siguiente entorno configurado en tu máquina de desarrollo:
- **Node.js** (Versión LTS recomendada)
- Gestor de paquetes: **npm** o **yarn**
- Un proyecto activo en la consola de [Firebase](https://console.firebase.google.com/)

### 🔑 Variables de Entorno

Para que la aplicación se conecte correctamente a tu instancia de Firebase, crea un archivo `.env` en la raíz del proyecto (este archivo está excluido en el `.gitignore` por seguridad) y añade tus credenciales:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=tu_api_key_aqui
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain_aqui
EXPO_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id_aqui
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket_aqui
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id_aqui
EXPO_PUBLIC_FIREBASE_APP_ID=tu_app_id_aqui
Pasos para el Despliegue
Clonar el repositorio e instalar dependencias:

Bash
npm install
Inicializar el servidor de desarrollo de Expo:

Bash
npm start
Ejecutar en la plataforma objetivo:

Android: Presiona a en la terminal o ejecuta npm run android

iOS: Presiona i en la terminal o ejecuta npm run ios

Web: Presiona w en la terminal o ejecuta npm run web

🔄 Tip de Desarrollo: Si realizas cambios estructurales o en las variables de entorno y necesitas limpiar la caché del bundler, inicia el servidor con:

Bash
npx expo start -c
🔒 Reglas de Seguridad de Firestore
Para garantizar el correcto aislamiento de los datos y evitar accesos no autorizados en producción, copia y pega la siguiente configuración dentro de la pestaña Rules en tu sección de Cloud Firestore en la consola de Firebase:

JavaScript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Restringe el acceso a la colección de items: solo el dueño de los datos puede leer o escribir
    match /users/{userId}/items/{itemId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Permite al usuario consultar su propio perfil, pero prohíbe escrituras directas del lado del cliente
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false;
    }
  }
}
📖 Guía de Uso
Acceso Inicial: Inicia la app en tu plataforma preferida (Expo Go, simulador local o entorno Web).

Autenticación: Regístrate como nuevo usuario o inicia sesión con una cuenta válida registrada en Firebase Auth.

Persistencia: Cierra la aplicación por completo y vuelve a abrirla; notarás que gracias a la integración con AsyncStorage, tu sesión se mantendrá activa de manera automática.

Operaciones CRUD: Desde el panel principal, interactúa creando, leyendo, editando o eliminando registros.

Auditoría de Datos: Puedes abrir la Consola de Firebase en paralelo para verificar de forma visual cómo se estructuran los documentos dinámicamente bajo users/{tu_uid}/items/{id_item} sin mezclarse con otros usuarios.

📂 Estructura Principal del Proyecto
A continuación se detallan los módulos críticos encargados del comportamiento del sistema:

Plaintext
├── assets/                          # Recursos estáticos (Imágenes y videos de prueba)
└── src/
    ├── config/
    │   └── firebase.js              # Inicialización del SDK de Firebase y exportación de Auth/Firestore.
    ├── services/
    │   └── items.js                 # Capa de servicio encargada de las operaciones CRUD con Firestore.
    └── screens/
        └── FirebaseAccessScreen.js  # Componente de interfaz de usuario para el login y gestión de datos.
📄 Licencia
Este proyecto está bajo la Licencia MIT. Siéntete libre de utilizarlo, modificarlo y distribuirlo para fines académicos, de aprendizaje o como base para desarrollos internos de software.