import React, { useState } from "react";
import { View, FlatList, TouchableOpacity, TextInput } from "react-native";
import { Text, Card } from "react-native-paper";

export default function ActivityScreen() {
  const [tab, setTab] = useState("upcoming");
  const [search, setSearch] = useState("");

  const colors = {
    primary: "#C17C74",
    background: "#FFFFFF",
    text: "#1F2937",
    light: "#FDF2F0",
    border: "#E5E7EB",
  };

  const upcoming = [
    { id: "1", date: "Tue 24 Mar", status: "Processing", price: "EGP 235" },
    { id: "2", date: "Fri 28 Mar", status: "Processing", price: "EGP 120" },
  ];

  const previous = [
    { id: "3", date: "Sat 11 Apr", status: "Delivered", price: "EGP 463.76" },
    { id: "4", date: "Mon 2 Apr", status: "Delivered", price: "EGP 310" },
  ];

  const data = tab === "upcoming" ? upcoming : previous;

  const filteredData = data.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.date.toLowerCase().includes(q) ||
      item.status.toLowerCase().includes(q) ||
      item.price.toLowerCase().includes(q)
    );
  });

  const getBadgeColor = (status) => {
    return status === "Delivered" ? colors.light : "#FFF4E5";
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 16,
        backgroundColor: colors.background,
      }}
    >
      {/* Title */}
      <Text
        style={{
          fontSize: 22,
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: 15,
          color: colors.text,
        }}
      >
        Activity History
      </Text>

      {/* Search */}
      <TextInput
        placeholder="Search orders..."
        value={search}
        onChangeText={setSearch}
        placeholderTextColor="#9CA3AF"
        style={{
          backgroundColor: "#F3F4F6",
          padding: 10,
          borderRadius: 10,
          marginBottom: 15,
          paddingHorizontal: 12,
        }}
      />

      {/* Tabs */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "#F3F4F6",
          borderRadius: 25,
          padding: 4,
          marginBottom: 15,
        }}
      >
        <TouchableOpacity
          onPress={() => setTab("upcoming")}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 25,
            alignItems: "center",
            backgroundColor:
              tab === "upcoming" ? colors.primary : "transparent",
          }}
        >
          <Text
            style={{
              color: tab === "upcoming" ? "#fff" : "#6B7280",
              fontWeight: "600",
            }}
          >
            Upcoming
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setTab("previous")}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 25,
            alignItems: "center",
            backgroundColor:
              tab === "previous" ? colors.primary : "transparent",
          }}
        >
          <Text
            style={{
              color: tab === "previous" ? "#fff" : "#6B7280",
              fontWeight: "600",
            }}
          >
            Previous
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Card
            style={{
              marginBottom: 12,
              borderRadius: 12,
              backgroundColor: "#fff",
            }}
          >
            <Card.Content>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ color: colors.text }}>{item.date}</Text>

                <View
                  style={{
                    backgroundColor: getBadgeColor(item.status),
                    paddingVertical: 4,
                    paddingHorizontal: 10,
                    borderRadius: 20,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "bold",
                      color: colors.primary,
                    }}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>

              <Text
                style={{
                  marginTop: 8,
                  fontWeight: "bold",
                  color: colors.text,
                }}
              >
                {item.price}
              </Text>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
}
