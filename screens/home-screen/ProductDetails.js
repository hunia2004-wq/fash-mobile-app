import React from "react";
import { Image } from "react-native";
import { Block, Text, Button } from "galio-framework";
import COLORS from "./colors";

export default function ProductDetails({ route, navigation }) {
  const { item } = route.params;

  return (
    <Block flex style={{ backgroundColor: COLORS.bg, padding: 16 }}>
      
      <Image source={item.image} style={{ height: 250, borderRadius: 12 }} />

      <Text bold size={18}>{item.name}</Text>
      <Text>{item.price}</Text>

      <Button
        color={COLORS.primary}
        style={{ marginTop: 20 }}
        onPress={() => navigation.navigate("Checkout")}
      >
        Add to Cart
      </Button>

    </Block>
  );
}