import React from "react";
import { Image } from "react-native";
import { Block, Text } from "galio-framework";
import COLORS from "./colors";

export default function OutfitBuilder() {
  return (
    <Block flex style={{ backgroundColor: COLORS.bg, padding: 16 }}>

      <Text bold>Build Your Outfit</Text>

      <Block row style={{ marginTop: 20 }}>
        <Image
          source={require("./images/outfit1.png")}
          style={{ width: 100, height: 120, marginRight: 10 }}
        />
        <Image
          source={require("./images/outfit2.png")}
          style={{ width: 100, height: 120 }}
        />
      </Block>

    </Block>
  );
}