import React from "react";
import { Block, Text, Button } from "galio-framework";
import COLORS from "./colors";

export default function ConfirmBid({ route }) {
  const { bid } = route.params;

  return (
    <Block flex middle style={{ backgroundColor: COLORS.bg }}>

      <Text bold size={20}>Confirm Bid</Text>

      <Text>You placed {bid} LE</Text>

      <Button color={COLORS.primary} style={{ marginTop: 20 }}>
        Confirm
      </Button>

    </Block>
  );
}