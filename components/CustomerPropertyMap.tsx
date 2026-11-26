
import React from "react";
import { Text, View } from "react-native";

type Props = {
  latitude: number;
  longitude: number;
  customerName: string;
  address: string;
};

export default function CustomerPropertyMap({
  latitude,
  longitude,
  address,
}: Props) {
  return (
    <View style={{ padding: 12 }}>
      <Text>{address}</Text>
      <Text>
        Coordinates: {latitude.toFixed(5)},{" "}
        {longitude.toFixed(5)}
      </Text>
    </View>
  );
}
