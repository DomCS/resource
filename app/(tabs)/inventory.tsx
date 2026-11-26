import { useRouter } from "expo-router";
import { useState } from "react";

import { Alert, Text, View } from "react-native";
import {
  Button,
  Card,
  Field,
  Heading,
  Page,
  Tag,
  colors,
  s,
} from "../../components/ui";
import PageNavigation from "../../components/PageNavigation"
import { useAppData } from "../../context/AppDataContext";
import { InventoryItem, uid } from "../../lib/types";
const blank = (): InventoryItem => ({
  id: uid(),
  name: "",
  sku: "",
  quantity: 0,
  minimum: 0,
  unit: "each",
  location: "",
  unitCost: "",
});
export default function Inventory() {
  const { data, update } = useAppData();
  // const router = useRouter();
  // const active = data.shifts.filter((x) => !x.clockOut).length;
  // const openJobs = data.jobs.filter((x) => x.status !== "Completed").length;
  const [form, setForm] = useState<InventoryItem | null>(null);
  const set = (k: keyof InventoryItem, v: any) =>
    setForm((p) => (p ? { ...p, [k]: v } : p));
  const save = () => {
    if (!form) return;
    if (!form.name.trim()) {
      Alert.alert("Item name required");
      return;
    }
    update((d) => ({
      ...d,
      inventory: d.inventory.some((x) => x.id === form.id)
        ? d.inventory.map((x) => (x.id === form.id ? form : x))
        : [form, ...d.inventory],
    }));
    setForm(null);
  };
  return (
    <Page>
      <Heading
        title="Inventory"
        subtitle="Track parts, materials, stock levels, and storage locations"
      />
         {PageNavigation()}
      <Button title="＋ Add inventory item" onPress={() => setForm(blank())} />
      {form && (
        <Card>
          <Text style={s.title}>
            {data.inventory.some((x) => x.id === form.id)
              ? "Edit item"
              : "New inventory item"}
          </Text>
          <Field
            label="Item name"
            value={form.name}
            onChangeText={(v) => set("name", v)}
          />
          <View style={s.row}>
            <Field
              label="SKU / part number"
              value={form.sku}
              onChangeText={(v) => set("sku", v)}
            />
            <Field
              label="Unit"
              value={form.unit}
              onChangeText={(v) => set("unit", v)}
              placeholder="each, box, ft"
            />
          </View>
          <View style={s.row}>
            <Field
              label="Quantity on hand"
              value={String(form.quantity)}
              onChangeText={(v) => set("quantity", Number(v) || 0)}
              keyboardType="numeric"
            />
            <Field
              label="Low-stock threshold"
              value={String(form.minimum)}
              onChangeText={(v) => set("minimum", Number(v) || 0)}
              keyboardType="numeric"
            />
          </View>
          <View style={s.row}>
            <Field
              label="Unit cost ($)"
              value={form.unitCost}
              onChangeText={(v) => set("unitCost", v)}
              keyboardType="decimal-pad"
            />
            <Field
              label="Storage location"
              value={form.location}
              onChangeText={(v) => set("location", v)}
            />
          </View>
          <View style={s.row}>
            <Button title="Save item" onPress={save} />
            <Button
              title="Cancel"
              kind="secondary"
              onPress={() => setForm(null)}
            />
          </View>
        </Card>
      )}
      {data.inventory.map((item) => (
        <Card key={item.id}>
          <View style={[s.row, { justifyContent: "space-between" }]}>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>{item.name}</Text>
              <Text style={s.small}>
                {item.sku || "No SKU"} · {item.location || "No location"}
              </Text>
            </View>
            <Tag
              text={item.quantity <= item.minimum ? "LOW STOCK" : "IN STOCK"}
              color={
                item.quantity <= item.minimum ? colors.yellow : colors.accent
              }
            />
          </View>
          <Text
            style={{
              fontSize: 26,
              fontWeight: "800",
              color: colors.text,
              marginTop: 10,
            }}
          >
            {item.quantity}{" "}
            <Text style={{ fontSize: 13, color: colors.muted }}>
              {item.unit}
            </Text>
          </Text>
          <Text style={s.small}>
            Minimum: {item.minimum} {item.unit}
            {item.unitCost ? ` · Unit cost $${item.unitCost}` : ""}
          </Text>
          <View style={[s.row, { marginTop: 10 }]}>
            <Button
              title="− 1"
              kind="secondary"
              onPress={() =>
                update((d) => ({
                  ...d,
                  inventory: d.inventory.map((x) =>
                    x.id === item.id
                      ? { ...x, quantity: Math.max(0, x.quantity - 1) }
                      : x,
                  ),
                }))
              }
            />
            <Button
              title="＋ 1"
              kind="secondary"
              onPress={() =>
                update((d) => ({
                  ...d,
                  inventory: d.inventory.map((x) =>
                    x.id === item.id ? { ...x, quantity: x.quantity + 1 } : x,
                  ),
                }))
              }
            />
            <Button
              title="Edit"
              kind="ghost"
              onPress={() => setForm({ ...item })}
            />
            <Button
              title="Delete"
              kind="danger"
              onPress={() =>
                Alert.alert(
                  "Delete item?",
                  "This removes the inventory record.",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () =>
                        update((d) => ({
                          ...d,
                          inventory: d.inventory.filter(
                            (x) => x.id !== item.id,
                          ),
                        })),
                    },
                  ],
                )
              }
            />
          </View>
        </Card>
      ))}
      {data.inventory.length === 0 && !form ? (
        <Card>
          <Text style={s.small}>
            No inventory items yet. Add parts or supplies to track on-hand
            quantities and low-stock thresholds.
          </Text>
        </Card>
      ) : null}
    </Page>
  );
}
