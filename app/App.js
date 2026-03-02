import { StatusBar } from "expo-status-bar";
import { View, Text } from "react-native";

export default function App() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",

        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontSize: "20%",
        }}
      >
        welcome
      </Text>
    </View>
  );
}
