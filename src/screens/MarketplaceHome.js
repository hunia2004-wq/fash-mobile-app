
import React from "react";
import { FlatList, TouchableOpacity, Image } from "react-native";
import { Block, Text } from "galio-framework";
import COLORS from "../../theme/colors";

const DATA = [
  {
    id: "1",
    name: "Black Carrycot",
    price: "4000 LE",
    image: require("../../assets/images/baby.png"),
  },
];

export default function MarketplaceHome({ navigation }) {
  return (
    <Block flex style={{ backgroundColor: COLORS.bg, padding: 16 }}>
      <Text bold size={20}>Marketplace</Text>

      <FlatList
        data={DATA}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("ProductDetails", { item })
            }
          >
            <Block style={{
              backgroundColor: COLORS.card,
              padding: 10,
              borderRadius: 12,
              marginTop: 10
            }}>
              <Image source={item.image} style={{ height: 150, borderRadius: 10 }} />
              <Text bold>{item.name}</Text>
              <Text>{item.price}</Text>
            </Block>
          </TouchableOpacity>
        )}
      />
    </Block>
  );
}
