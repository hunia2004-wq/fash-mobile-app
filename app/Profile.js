import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

const colors = {
primary: "#C17C74",
background: "#FFFFFF",
text: "#1F2937",
border: "#E5E7EB",
white: "#FFFFFF",
};

export default function Profile({ navigation }) {

const MenuItem = ({ title, screen, isDanger }) => (
<TouchableOpacity
style={styles.item}
onPress={() => screen && navigation.navigate(screen)}
>
<Text style={[styles.itemText, isDanger && styles.dangerText]}>
{title}
</Text>
<Ionicons name="chevron-forward" size={18} color={colors.primary} />
</TouchableOpacity>
);

return (
<View style={styles.container}>

{/* Header */}
<View style={styles.header}>
<TouchableOpacity onPress={() => navigation.goBack()}>
<Ionicons name="chevron-back" size={24} color={colors.primary} />
</TouchableOpacity>

<Text style={styles.headerTitle}>Account settings</Text>

{/* Empty space for alignment */}
<View style={{ width: 24 }} />
</View>

{/* Main Section */}
<View style={styles.list}>
<MenuItem title="Personal Information" screen="PersonalInfo" />
<MenuItem title="Saved Addresses" screen="SavedAddresses" />
<MenuItem title="Email Address" screen="EmailAddress" />
<MenuItem title="Saved Cards" screen="SavedCards" />
<MenuItem title="Notifications & Sms" screen="Notifications" />
</View>

{/* Delete Section */}
<View style={styles.list}>
<MenuItem title="Delete Account" isDanger />
</View>
</View>
);
}

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: "#F9FAFB",
},

header: {
flexDirection: "row",
alignItems: "center",
justifyContent: "space-between",
paddingHorizontal: 15,
paddingTop: 55,
paddingBottom: 15,
backgroundColor: "#FFFFFF",
},

headerTitle: {
fontSize: 18,
fontWeight: "600",
color: "#1F2937",
},

list: {
backgroundColor: "#FFFFFF",
marginTop: 20,
borderTopWidth: 1,
borderTopColor: "#E5E7EB",
},

item: {
flexDirection: "row",
justifyContent: "space-between",
alignItems: "center",
paddingVertical: 18,
paddingHorizontal: 15,
borderBottomWidth: 1,
borderBottomColor: "#E5E7EB",
},

itemText: {
fontSize: 16,
color: "#1F2937",
},

dangerText: {
color: "#C17C74",
fontWeight: "500",
},
});

      
