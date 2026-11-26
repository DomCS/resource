// import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useState } from "react";

import { Alert, Text, View } from "react-native";
import { geocodeAddress } from "../../lib/geocode";
// import MapView, { Marker, Region } from "react-native-maps";
import CustomerPropertyMap from "../../components/CustomerPropertyMap";
import { Button, Card, Field, Heading, Page, s } from "../../components/ui";
import PageNavigation from "../../components/PageNavigation"

import { useAppData } from "../../context/AppDataContext";
import { Customer, uid } from "../../lib/types";
const blank = (): Customer => ({
  id: uid(),
  firstName: "",
  lastName: "",
  additionalNames: "",
  email: "",
  phone: "",
  customerType: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  postalCode: "",
  notes: "",
});
export default function Customers() {
  const { data, update } = useAppData();
  const router = useRouter();
  const active = data.shifts.filter((x) => !x.clockOut).length;
  const openJobs = data.jobs.filter((x) => x.status !== "Completed").length;
  const [form, setForm] = useState<Customer | null>(null);
  const [mapCustomer, setMapCustomer] = useState<Customer | null>(null);
  const set = (k: keyof Customer, v: string) =>
    setForm((p) => (p ? { ...p, [k]: v } : p));
  const save = () => {
    if (!form) return;
    if (!form.firstName.trim() && !form.lastName.trim()) {
      Alert.alert("Name required", "Enter at least a first or last name.");
      return;
    }
    update((d) => ({
      ...d,
      customers: d.customers.some((x) => x.id === form.id)
        ? d.customers.map((x) => (x.id === form.id ? form : x))
        : [form, ...d.customers],
    }));
    setForm(null);
  };
  const locate = async (c: Customer) => {
    const address = [c.address1, c.address2, c.city, c.state, c.postalCode]
      .filter(Boolean)
      .join(", ");

    if (!address.trim()) {
      Alert.alert("Address required", "Add a property address first.");
      return;
    }

    try {
      console.log("Looking up address:", address);

      const result = await geocodeAddress(address);

      if (!result) {
        Alert.alert(
          "Address not found",
          "No match was returned. Check the street, city, state, and ZIP code.",
        );
        return;
      }

      const next: Customer = {
        ...c,
        latitude: result.latitude,
        longitude: result.longitude,
      };

      update((d) => ({
        ...d,
        customers: d.customers.map((x) => (x.id === c.id ? next : x)),
      }));

      setMapCustomer(next);

      console.log("Map coordinates:", result);
    } catch (error) {
      console.error("Property lookup failed:", error);

      Alert.alert(
        "Property lookup failed",
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
      );
    }
  };
  return (
    <Page>
      <Heading
        title="Customers"
        subtitle={`${data.customers.length} customer records · people and property details`}
      />
      {PageNavigation()}
   
      <Button title="＋ Add customer" onPress={() => setForm(blank())} />
      {form && (
        <Card>
          <Text style={s.title}>
            {data.customers.some((x) => x.id === form.id)
              ? "Edit customer"
              : "New customer"}
          </Text>
          <View style={s.row}>
            <Field
              label="First name"
              value={form.firstName}
              onChangeText={(v) => set("firstName", v)}
            />
            <Field
              label="Last name"
              value={form.lastName}
              onChangeText={(v) => set("lastName", v)}
            />
            <Field
              label="Owner / Tenant"
              value={form.lastName}
              onChangeText={(v) => set("customerType", v)}
            />
          </View>
          <Field
            label="Additional people at this property"
            value={form.additionalNames}
            onChangeText={(v) => set("additionalNames", v)}
            placeholder="e.g. Alex and Jamie Rivera"
          />
          <Field
            label="Email address"
            value={form.email}
            onChangeText={(v) => set("email", v)}
            keyboardType="email-address"
          />
          <Field
            label="Phone number"
            value={form.phone}
            onChangeText={(v) => set("phone", v)}
            keyboardType="phone-pad"
          />
          <Field
            label="Property address"
            value={form.address1}
            onChangeText={(v) => set("address1", v)}
          />
          <Field
            label="Apartment / unit / second line"
            value={form.address2}
            onChangeText={(v) => set("address2", v)}
          />
          <View style={s.row}>
            <Field
              label="City"
              value={form.city}
              onChangeText={(v) => set("city", v)}
            />
            <Field
              label="State"
              value={form.state}
              onChangeText={(v) => set("state", v)}
            />
            <Field
              label="ZIP / postal code"
              value={form.postalCode}
              onChangeText={(v) => set("postalCode", v)}
            />
          </View>
          <Field
            label="Notes"
            value={form.notes}
            onChangeText={(v) => set("notes", v)}
            multiline
          />
          <View style={s.row}>
            <Button title="Save information" onPress={save} />
            <Button
              title="Cancel"
              kind="secondary"
              onPress={() => setForm(null)}
            />
          </View>
        </Card>
      )}
      {data.customers.map((c) => (
        <Card key={c.id}>
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>
                {c.firstName} {c.lastName}
              </Text>
              <Text style={s.small}>
                {c.address1}
                {c.address2 ? `, ${c.address2}` : ""}
              </Text>
            </View>
            <Button
              title="Edit information"
              kind="secondary"
              onPress={() => setForm({ ...c })}
            />
          </View>
          {c.additionalNames ? (
            <Text style={[s.small, { marginTop: 7 }]}>
              Also at property: {c.additionalNames}
            </Text>
          ) : null}
          <Text style={[s.small, { marginTop: 6 }]}>
            {c.email || "No email"} · {c.phone || "No phone"}
          </Text>
          <View style={[s.row, { marginTop: 10 }]}>
            <Button
              title="Property map"
              onPress={() =>
                c.latitude !== undefined ? setMapCustomer(c) : locate(c)
              }
            />
            <Button
              title="Delete"
              kind="danger"
              onPress={() =>
                Alert.alert(
                  "Delete customer?",
                  "This removes the customer record from this device.",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () =>
                        update((d) => ({
                          ...d,
                          customers: d.customers.filter((x) => x.id !== c.id),
                        })),
                    },
                  ],
                )
              }
            />
            {mapCustomer && c.address1 === mapCustomer.address1 && (
              <Card>
                <View style={[s.row, { justifyContent: "space-between" }]}>
                  <Text style={s.title}>Property location</Text>

                  <Button
                    title="Close map"
                    kind="secondary"
                    onPress={() => setMapCustomer(null)}
                  />
                </View>

                <Text style={[s.small, { marginBottom: 10 }]}>
                  {mapCustomer.address1}, {mapCustomer.city} {mapCustomer.state}{" "}
                  {mapCustomer.postalCode}
                </Text>

                {mapCustomer.latitude !== undefined &&
                  mapCustomer.longitude !== undefined && (
                    <CustomerPropertyMap
                      latitude={mapCustomer.latitude}
                      longitude={mapCustomer.longitude}
                      customerName={`${mapCustomer.firstName} ${mapCustomer.lastName}`}
                      address={mapCustomer.address1}
                    />
                  )}
              </Card>
            )}
          </View>
        </Card>
      ))}
      {data.customers.length === 0 && !form ? (
        <Card>
          <Text style={s.small}>
            No customers yet. Add a record to store contact details and a
            property address.
          </Text>
        </Card>
      ) : null}
    </Page>
  );
}
