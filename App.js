import FirebaseAccessScreen from "./src/screens/FirebaseAccessScreen";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {
  return (
    <SafeAreaProvider>
      <FirebaseAccessScreen />
    </SafeAreaProvider>
  );
}
