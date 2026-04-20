import React from "react";
import { Image } from "react-native";
import { Block, Text, Button } from "galio-framework";
import COLORS from "../../theme/colors";

export default function BiddingHome({ navigation }) {
  return (
    <Block flex style={{ backgroundColor: COLORS.bg, padding: 16 }}>

      <Image
        source={require("../../assets/images/nike.png")}
        style={{ width: "100%", height: 200, borderRadius: 12 }}
      />

      <Text bold size={18} style={{ marginTop: 10 }}>
        Nike KD 14 TB
      </Text>

      <Text>Current Bid: 7000 LE</Text>

      <Button
        color={COLORS.primary}
        style={{ marginTop: 20 }}
        onPress={() => navigation.navigate("BidInput")}
      >
        Place Bid
      </Button>

    </Block>
  );
}
