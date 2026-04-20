import React from "react";
import { Block, Text } from "galio-framework";
import COLORS from "./colors";

export default function PaymentScreen() {
  return (
    <Block flex middle style={{ backgroundColor: COLORS.bg }}>

      <Text bold>Payment Method</Text>
      <Text>**** **** 1174</Text>

    </Block>
  );
}