import React from "react";
import { Image, TouchableOpacity } from "react-native";
import { Block, Text } from "galio-framework";
import COLORS from "./colors";

export default function PackingHome({ navigation }) {
  return (
    <Block flex style={{ backgroundColor: COLORS.bg, padding: 16 }}>

      <Text bold size={18}>Summer Collection</Text>

      <TouchableOpacity
        onPress={() => navigation.navigate("OutfitBuilder")}
      >
        <Image
          source={require("./images/outfit1.png")}
          style={{ width: "100%", height: 150, borderRadius: 12, marginTop: 10 }}
        />
      </TouchableOpacity>

    </Block>
  );
}