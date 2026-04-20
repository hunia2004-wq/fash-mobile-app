
import React, { useState } from "react";
import {
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Block, Text } from "galio-framework";
import COLORS from "../theme/colors";

const API_KEY = "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";

export default function AIStylingScreen() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = { text: message, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);

    setMessage("");

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a fashion stylist assistant." },
            { role: "user", content: message },
          ],
        }),
      });

      const data = await res.json();

      const aiMsg = {
        text: data.choices[0].message.content,
        sender: "ai",
      };

      setMessages((prev) => [...prev, aiMsg]);

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >

      <ScrollView style={{ flex: 1, padding: 16 }}>
        {messages.map((msg, i) => (
          <Block
            key={i}
            style={{
              alignSelf:
                msg.sender === "user" ? "flex-end" : "flex-start",
              backgroundColor:
                msg.sender === "user"
                  ? COLORS.primary
                  : COLORS.card,
              padding: 12,
              borderRadius: 12,
              marginVertical: 5,
              maxWidth: "80%",
            }}
          >
            <Text>{msg.text}</Text>
          </Block>
        ))}
      </ScrollView>

      <Block row style={{ padding: 10, backgroundColor: COLORS.primary }}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Ask for outfit ideas..."
          style={{
            flex: 1,
            backgroundColor: "#fff",
            borderRadius: 10,
            padding: 10,
          }}
        />

        <TouchableOpacity onPress={sendMessage}>
          <Text>Send</Text>
        </TouchableOpacity>
      </Block>

    </KeyboardAvoidingView>
  );
}
