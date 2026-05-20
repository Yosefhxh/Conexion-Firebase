import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, isFirebaseConfigured, requiredConfigKeys } from "../config/firebase";
import { createItem, removeItem, subscribeToItems, updateItem } from "../services/items";

const emptyForm = {
  title: "",
  description: "",
};

const formatDate = (value) => {
  if (!value?.toDate) {
    return "Pendiente de sincronización";
  }

  return value.toDate().toLocaleString("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default function FirebaseAccessScreen() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemForm, setItemForm] = useState(emptyForm);
  const [editingItemId, setEditingItemId] = useState(null);
  const [savingItem, setSavingItem] = useState(false);
  const [crudError, setCrudError] = useState("");

  useEffect(() => {
    if (!auth) {
      setAuthReady(true);
      return undefined;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });

    return unsubscribeAuth;
  }, []);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setItemsLoading(false);
      return undefined;
    }

    setItemsLoading(true);

    const unsubscribeItems = subscribeToItems(
      user.uid,
      (nextItems) => {
        setItems(nextItems);
        setItemsLoading(false);
      },
      (error) => {
        setCrudError(error.message);
        setItemsLoading(false);
      },
    );

    return unsubscribeItems;
  }, [user]);

  const authButtonLabel = useMemo(() => {
    return mode === "login" ? "Iniciar sesión" : "Crear cuenta";
  }, [mode]);

  const resetItemForm = () => {
    setItemForm(emptyForm);
    setEditingItemId(null);
  };

  const handleAuthSubmit = async () => {
    if (!auth) {
      return;
    }

    setAuthError("");
    setAuthLoading(true);

    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSaveItem = async () => {
    if (!user) {
      return;
    }

    if (!itemForm.title.trim()) {
      setCrudError("El título es obligatorio.");
      return;
    }

    setCrudError("");
    setSavingItem(true);

    try {
      if (editingItemId) {
        await updateItem(user.uid, editingItemId, itemForm);
      } else {
        await createItem(user.uid, itemForm);
      }

      resetItemForm();
    } catch (error) {
      setCrudError(error.message);
    } finally {
      setSavingItem(false);
    }
  };

  const handleEditItem = (item) => {
    setItemForm({
      title: item.title ?? "",
      description: item.description ?? "",
    });
    setEditingItemId(item.id);
  };

  const handleDeleteItem = (itemId) => {
    if (!user) {
      return;
    }

    Alert.alert("Eliminar registro", "Esta acción no se puede deshacer.", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await removeItem(user.uid, itemId);
            if (editingItemId === itemId) {
              resetItemForm();
            }
          } catch (error) {
            setCrudError(error.message);
          }
        },
      },
    ]);
  };

  const handleLogout = async () => {
    if (!auth) {
      return;
    }

    await signOut(auth);
    resetItemForm();
    setItems([]);
  };

  const appBody = !isFirebaseConfigured ? (
    <View style={styles.noticeCard}>
      <Text style={styles.noticeTitle}>Falta configurar Firebase</Text>
      <Text style={styles.noticeText}>
        Crea variables de entorno EXPO_PUBLIC_FIREBASE_* para estos campos:
      </Text>
      <View style={styles.noticeList}>
        {requiredConfigKeys.map((key) => (
          <Text key={key} style={styles.noticeItem}>
            • {key}
          </Text>
        ))}
      </View>
    </View>
  ) : !authReady ? (
    <View style={styles.loadingCard}>
      <ActivityIndicator color="#0F766E" />
      <Text style={styles.loadingText}>Preparando autenticación...</Text>
    </View>
  ) : user ? (
    <View style={styles.sectionStack}>
      <View style={styles.userCard}>
        <View>
          <Text style={styles.userLabel}>Sesión activa</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
        <Pressable style={styles.secondaryButton} onPress={handleLogout}>
          <Text style={styles.secondaryButtonText}>Cerrar sesión</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{editingItemId ? "Editar registro" : "Nuevo registro"}</Text>
          {editingItemId ? (
            <Pressable onPress={resetItemForm}>
              <Text style={styles.linkText}>Cancelar edición</Text>
            </Pressable>
          ) : null}
        </View>

        <TextInput
          style={styles.input}
          value={itemForm.title}
          onChangeText={(value) => setItemForm((current) => ({ ...current, title: value }))}
          placeholder="Título"
          placeholderTextColor="#94A3B8"
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          value={itemForm.description}
          onChangeText={(value) => setItemForm((current) => ({ ...current, description: value }))}
          placeholder="Descripción"
          placeholderTextColor="#94A3B8"
          multiline
          textAlignVertical="top"
        />

        {crudError ? <Text style={styles.errorText}>{crudError}</Text> : null}

        <Pressable style={styles.primaryButton} onPress={handleSaveItem} disabled={savingItem}>
          {savingItem ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>{editingItemId ? "Actualizar" : "Guardar"}</Text>}
        </Pressable>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Tus registros</Text>
          <Text style={styles.mutedText}>{items.length} elementos</Text>
        </View>

        {itemsLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#0F766E" />
            <Text style={styles.loadingText}>Sincronizando datos...</Text>
          </View>
        ) : items.length === 0 ? (
          <Text style={styles.emptyState}>Todavía no tienes registros. Crea el primero arriba.</Text>
        ) : (
          items.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDescription}>{item.description || "Sin descripción"}</Text>
                <Text style={styles.itemMeta}>Actualizado: {formatDate(item.updatedAt)}</Text>
              </View>

              <View style={styles.itemActions}>
                <Pressable style={styles.textButton} onPress={() => handleEditItem(item)}>
                  <Text style={styles.textButtonLabel}>Editar</Text>
                </Pressable>
                <Pressable style={styles.dangerButton} onPress={() => handleDeleteItem(item.id)}>
                  <Text style={styles.dangerButtonText}>Eliminar</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  ) : (
    <View style={styles.authCard}>
      <View style={styles.segmentedControl}>
        <Pressable
          style={[styles.segmentButton, mode === "login" && styles.segmentButtonActive]}
          onPress={() => setMode("login")}
        >
          <Text style={[styles.segmentButtonText, mode === "login" && styles.segmentButtonTextActive]}>Entrar</Text>
        </Pressable>
        <Pressable
          style={[styles.segmentButton, mode === "register" && styles.segmentButtonActive]}
          onPress={() => setMode("register")}
        >
          <Text style={[styles.segmentButtonText, mode === "register" && styles.segmentButtonTextActive]}>Crear cuenta</Text>
        </Pressable>
      </View>

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Correo electrónico"
        placeholderTextColor="#94A3B8"
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Contraseña"
        placeholderTextColor="#94A3B8"
        secureTextEntry
      />

      {authError ? <Text style={styles.errorText}>{authError}</Text> : null}

      <Pressable style={styles.primaryButton} onPress={handleAuthSubmit} disabled={authLoading}>
        {authLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>{authButtonLabel}</Text>}
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <Text style={styles.kicker}>Firebase Access & CRUD</Text>
            <Text style={styles.title}>Control de acceso y datos en tiempo real</Text>
            <Text style={styles.subtitle}>
              Autenticación persistente y operaciones CRUD sobre Firestore con una estructura por usuario.
            </Text>
          </View>

          {authError && user ? <Text style={styles.errorBanner}>{authError}</Text> : null}
          {crudError && user ? <Text style={styles.errorBanner}>{crudError}</Text> : null}

          {appBody}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#081120",
  },
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#081120",
  },
  hero: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 28,
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.18)",
  },
  kicker: {
    color: "#5EEAD4",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    color: "#F8FAFC",
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    marginBottom: 10,
  },
  subtitle: {
    color: "#CBD5E1",
    fontSize: 15,
    lineHeight: 22,
  },
  sectionStack: {
    gap: 16,
  },
  card: {
    backgroundColor: "#0F172A",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.16)",
  },
  authCard: {
    backgroundColor: "#0F172A",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.16)",
    gap: 12,
  },
  userCard: {
    backgroundColor: "#10233E",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(94, 234, 212, 0.2)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  userLabel: {
    color: "#5EEAD4",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  userEmail: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "700",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 12,
  },
  cardTitle: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "700",
  },
  linkText: {
    color: "#5EEAD4",
    fontWeight: "700",
  },
  mutedText: {
    color: "#94A3B8",
    fontSize: 13,
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: "#111C33",
    borderRadius: 18,
    padding: 4,
    gap: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  segmentButtonActive: {
    backgroundColor: "#5EEAD4",
  },
  segmentButtonText: {
    color: "#CBD5E1",
    fontWeight: "700",
  },
  segmentButtonTextActive: {
    color: "#062B2A",
  },
  input: {
    backgroundColor: "#111C33",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: "#F8FAFC",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.16)",
  },
  textArea: {
    minHeight: 110,
  },
  primaryButton: {
    backgroundColor: "#0F766E",
    borderRadius: 16,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "#13253D",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: "#E2E8F0",
    fontWeight: "700",
  },
  textButton: {
    backgroundColor: "rgba(94, 234, 212, 0.12)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textButtonLabel: {
    color: "#5EEAD4",
    fontWeight: "700",
  },
  dangerButton: {
    backgroundColor: "rgba(248, 113, 113, 0.12)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dangerButtonText: {
    color: "#FCA5A5",
    fontWeight: "700",
  },
  errorText: {
    color: "#FDA4AF",
    fontSize: 13,
    lineHeight: 18,
  },
  errorBanner: {
    backgroundColor: "rgba(244, 63, 94, 0.12)",
    color: "#FDA4AF",
    borderWidth: 1,
    borderColor: "rgba(244, 63, 94, 0.24)",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  loadingCard: {
    backgroundColor: "#0F172A",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.16)",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 10,
  },
  loadingText: {
    color: "#CBD5E1",
  },
  emptyState: {
    color: "#94A3B8",
    lineHeight: 22,
  },
  itemCard: {
    backgroundColor: "#111C33",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.12)",
    gap: 12,
  },
  itemContent: {
    gap: 6,
  },
  itemTitle: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "700",
  },
  itemDescription: {
    color: "#CBD5E1",
    lineHeight: 20,
  },
  itemMeta: {
    color: "#64748B",
    fontSize: 12,
  },
  itemActions: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  noticeCard: {
    backgroundColor: "#0F172A",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.22)",
  },
  noticeTitle: {
    color: "#FCA5A5",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  noticeText: {
    color: "#CBD5E1",
    lineHeight: 22,
    marginBottom: 10,
  },
  noticeList: {
    gap: 6,
  },
  noticeItem: {
    color: "#E2E8F0",
    lineHeight: 20,
  },
});