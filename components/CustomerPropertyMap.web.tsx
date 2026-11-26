
import React from "react";
import { Text, View } from "react-native";

type Props = {
  latitude: number;
  longitude: number;
  customerName: string;
  address: string;
};

const IFrame = "iframe" as React.ElementType;

export default function CustomerPropertyMap({
  latitude,
  longitude,
  customerName,
  address,
}: Props) {
  const padding = 0.01;

  const bbox = [
    longitude - padding,
    latitude - padding,
    longitude + padding,
    latitude + padding,
  ].join(",");

  const mapUrl =
    `https://www.openstreetmap.org/export/embed.html` +
    `?bbox=${bbox}` +
    `&layer=mapnik` +
    `&marker=${latitude},${longitude}`;

  return (
    <View>
      <IFrame
        title={`Map of ${customerName}'s property`}
        src={mapUrl}
        style={{
          width: "100%",
          height: 270,
          border: 0,
          borderRadius: 12,
        }}
        loading="lazy"
      />

      <Text style={{ marginTop: 8 }}>
        {address}
      </Text>

      <Text style={{ marginTop: 4 }}>
        Pin coordinates: {latitude.toFixed(5)},{" "}
        {longitude.toFixed(5)}
      </Text>
    </View>
  );
}
