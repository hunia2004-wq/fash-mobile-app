import React, { useState } from "react";
import { TextInput } from "react-native";
import { Block, Text, Button } from "galio-framework";
import COLORS from "./colors";

export default function BidInput({ navigation }) {
  const [bid, setBid] = useState("");

  return (
    <Block flex middle style={{ backgroundColor: COLORS.bg }}>

      <Text bold>Enter Bid</Text>

      <TextInput
        value={bid}
        onChangeText={setBid}
        placeholder="7000"
        style={{
          backgroundColor: COLORS.card,
          width: "80%",
          padding: 10,
          marginTop: 20,
          borderRadius: 10,
        }}
      />

      <Button
        color={COLORS.primary}
        style={{ marginTop: 20 }}
        onPress={() => navigation.navigate("ConfirmBid", { bid })}
      >
        Continue
      </Button>

    </Block>
  );
}