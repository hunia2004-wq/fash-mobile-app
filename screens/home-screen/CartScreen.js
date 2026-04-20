import React from "react";
import { Image } from "react-native";
import { Block, Text, Button } from "galio-framework";
import COLORS from "./colors";

export default function CartScreen({ navigation }) {
  return (
    <Block flex style={{ backgroundColor: COLORS.bg, padding: 16 }}>

      <Image
        source={require("./images/baby.png")}
        style={{ width: "100%", height: 200, borderRadius: 12 }}
      />

      <Text bold>Black Carrycot</Text>
      <Text>4000 LE</Text>

      <Button
        color={COLORS.primary}
        onPress={() => navigation.navigate("Payment")}
        style={{ marginTop: 20 }}
      >
        Checkout
      </Button>

    </Block>
  );
}