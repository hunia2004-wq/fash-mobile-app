import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, List } from "react-native-paper";
import { useState } from "react";

const colors = {
  primary: "#C17C74",
  background: "#FFFFFF",
  text: "#1F2937",
  border: "#E5E7EB",
  white: "#FFFFFF",
};

export default function Language() {
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  const languages = ["English", "Arabic"];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Language</Text>

      <View style={styles.listContainer}>
        {languages.map((lang) => {
          const isSelected = selectedLanguage === lang;

          return (
            <TouchableOpacity
              key={lang}
              style={[
                styles.item,
                isSelected && styles.selectedItem,
              ]}
              onPress={() => setSelectedLanguage(lang)}
            >
              <Text
                style={[
                  styles.itemText,
                  isSelected && styles.selectedText,
                ]}
              >
                {lang}
              </Text>

              {isSelected && (
                <Text style={styles.check}>✓</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
