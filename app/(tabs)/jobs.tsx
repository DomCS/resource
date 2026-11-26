import { useState } from "react";

import * as ImagePicker from "expo-image-picker";
import { Alert, Image, ScrollView, Text, View } from "react-native";

import PageNavigation from "../../components/PageNavigation";
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

import { useAppData } from "../../context/AppDataContext";
import type { Job, JobPart } from "../../lib/types";
import { uid } from "../../lib/types";

const blank = (): Job => ({
  id: uid(),
  title: "",
  status: "Scheduled",
  customerId: "",
  customerName: "",
  description: "",
  propertyAddress: "",
  scheduledDate: new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(new Date()),
  // new Date().toISOString().slice(0, 10),
  parts: [],
  photos: [],
});

export default function Jobs() {
  const { data, update } = useAppData();
  const [form, setForm] = useState<Job | null>(null);
  const [focus, setFocus] = useState<"list" | "detail">("list");
  const [partName, setPartName] = useState("");
  const [partQty, setPartQty] = useState("1");
  const [partCost, setPartCost] = useState("");

  const set = <K extends keyof Job>(key: K, value: Job[K]) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  };

  const openNewJob = () => {
    setForm(blank());
    setPartName("");
    setPartQty("1");
    setPartCost("");
    setFocus("detail");
  };

  const select = (job: Job) => {
    setForm({
      ...job,
      parts: [...job.parts],
      photos: [...job.photos],
    });
    setPartName("");
    setPartQty("1");
    setPartCost("");
    setFocus("detail");
  };

  const cancel = () => {
    setForm(null);
    setFocus("list");
  };

  const save = () => {
    if (!form) return;

    if (!form.title.trim()) {
      Alert.alert("Job title required", "Enter a title before saving.");
      return;
    }

    update((current) => ({
      ...current,
      jobs: current.jobs.some((job) => job.id === form.id)
        ? current.jobs.map((job) => (job.id === form.id ? form : job))
        : [form, ...current.jobs],
    }));

    // setForm(null);
    // setFocus("list");
  };
  const saveClose = () => {
    save();

    setForm(null);
    setFocus("list");
  };

  const deleteJob = () => {
    if (!form) return;

    Alert.alert("Delete job?", "This removes the job record.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          update((current) => ({
            ...current,
            jobs: current.jobs.filter((job) => job.id !== form.id),
          }));
          setForm(null);
          setFocus("list");
        },
      },
    ]);
  };

  const addPart = () => {
    if (!form || !partName.trim()) {
      Alert.alert("Part name required", "Enter a part or material name.");
      return;
    }

    const part: JobPart = {
      id: uid(),
      name: partName.trim(),
      quantity: Math.max(1, Number(partQty) || 1),
      unitCost: partCost.trim(),
    };

    set("parts", [...form.parts, part]);
    setPartName("");
    setPartQty("1");
    setPartCost("");
  };

  const removePart = (partId: string) => {
    if (!form) return;

    set(
      "parts",
      form.parts.filter((part) => part.id !== partId),
    );
  };

  const addPhotos = async () => {
    if (!form) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        quality: 0.75,
      });

      if (!result.canceled) {
        set("photos", [
          ...form.photos,
          ...result.assets.map((asset) => asset.uri),
        ]);
      }
    } catch {
      Alert.alert(
        "Unable to select photos",
        "Please try opening the photo library again.",
      );
    }
  };

  const removePhoto = (index: number) => {
    if (!form) return;

    set(
      "photos",
      form.photos.filter((_, photoIndex) => photoIndex !== index),
    );
  };

  const isExistingJob = form
    ? data.jobs.some((job) => job.id === form.id)
    : false;

  const setColorCode = (status: String) => {
    switch (status) {
      case "On hold": {
        return colors.yellow;
      }
      case "Scheduled": {
        return colors.blue;
      }

      case "Completed": {
        return "ghost";
      }
      case "In progress": {
        return colors.accent;
      }
    }
  };
  const timeDifference = (schedule: Date) => {
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.floor((new Date(schedule).getTime() - Date.now()) / msPerDay);
  };

  return (
    <Page>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Heading
          title="Jobs"
          subtitle="Schedule work, manage parts, and attach property photos"
        />

        {PageNavigation()}
        <View style={[s.row, { marginBottom: 12 }]}>
          <Button title="+ New job" onPress={openNewJob} />

          {form && (
            <Button title="All jobs" kind="secondary" onPress={cancel} />
          )}
        </View>

        {!form || focus === "list" ? (
          <View>
            <Text style={[s.title, { marginBottom: 10 }]}>
              Job board ({data.jobs.length})
            </Text>

            {data.jobs.map((job) => (
              <Card key={job.id} style={{ padding: 12 }}>
                <View
                  style={{
                    flexDirection: "row",
                    // justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <Text style={s.title}>{job.title || "Untitled job"}</Text>
                  <Text style={[s.muted, {marginLeft: 10}]}>
                    {job.customerName || "New Customer"}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <Text style={[s.title, s.small, { alignSelf: "flex-start" }]}>
                    {job.scheduledDate || "Untitled job"}
                  </Text>
                  <Text
                    style={[
                      {
                        color: "white",
                        alignSelf: "flex-end",
                      },
                    ]}
                  >
                    {timeDifference(new Date(job.scheduledDate)) < 0
                      ? timeDifference(new Date(job.scheduledDate))
                          .toString()
                          .slice(1) + " days ago."
                      : timeDifference(new Date(job.scheduledDate)) +
                        " days away."}
                  </Text>
                </View>

                <Text style={[s.small, { marginVertical: 5 }]}>
                  {job.propertyAddress || "No property address"}
                </Text>

                <Tag
                  text={job.status}
                  color={
                    setColorCode(job.status)
                    // job.status === "Completed"
                    //   ? colors.accent
                    //   : job.status === "In progress"
                    //     ? colors.blue
                    //     : colors.yellow
                  }
                />

                <View style={{ marginTop: 10 }}>
                  <Button
                    title="Open job details"
                    kind="secondary"
                    onPress={() => select(job)}
                  />
                </View>
              </Card>
            ))}

            {data.jobs.length === 0 && (
              <Card>
                <Text style={s.small}>
                  No jobs yet. Create one to get started.
                </Text>
              </Card>
            )}
          </View>
        ) : null}

        {form && focus === "detail" && (
          <View>
            <Card>
              <Text style={s.title}>
                {isExistingJob ? "Edit job" : "New job details"}
              </Text>

              <Field
                label="Job title"
                value={form.title}
                onChangeText={(value) => {
                  set("title", value);
                  save();
                }}
              />

              <Text style={[s.label, { marginTop: 10 }]}>Customer</Text>
              <Field
                label="Customer name"
                value={form.customerName}
                onChangeText={(value) => set("customerName", value)}
              />
              <Text style={[s.label, { marginTop: 10 }]}>Property</Text>

              {data.customers.length === 0 ? (
                <Text style={[s.small, { marginBottom: 8 }]}>
                  Add a customer first, or enter the property address below.
                </Text>
              ) : (
                data.customers.map((customer) =>
                  customer.id === form.customerId ? ( // ensures only matching customer data is shown
                    <View key={customer.id} style={{ marginBottom: 6 }}>
                      <Button
                        title={
                          `${form.customerId === customer.id ? "✓ " : ""}` +
                          `${customer.firstName} ${customer.lastName}` +
                          ` · ${customer.address1 || "No address"}, ` +
                          `${customer.city} ` +
                          `${customer.state} ` +
                          `${customer.postalCode}`
                        }
                        kind={
                          form.customerId === customer.id
                            ? "primary"
                            : "secondary"
                        }
                        onPress={() => {
                          set("customerId", customer.id);
                          set(
                            "propertyAddress",
                            [
                              customer.address1,
                              customer.city,
                              customer.state,
                              customer.postalCode,
                            ]
                              .filter(Boolean)
                              .join(", "),
                          );
                        }}
                      />
                    </View>
                  ) : (
                    <View key={Math.random() + "_blank"}></View>
                  ),
                )
              )}

              <Field
                label="Property address"
                value={form.propertyAddress}
                onChangeText={(value) => set("propertyAddress", value)}
              />

              <Field
                label="Scheduled date (MM-DD-YYYY)"
                value={form.scheduledDate}
                onChangeText={(value) => set("scheduledDate", value)}
              />

              <Text style={[s.label, { marginTop: 10 }]}>Job status</Text>

              <View style={[s.row, { flexWrap: "wrap" }]}>
                {(
                  ["Scheduled", "In progress", "On hold", "Completed"] as const
                ).map((status) => (
                  <Button
                    key={status}
                    title={`${form.status === status ? "✓ " : ""}${status}`}
                    kind={form.status === status ? "primary" : "secondary"}
                    onPress={() => set("status", status)}
                  />
                ))}
              </View>

              <Field
                label="Job description / scope of work"
                value={form.description}
                onChangeText={(value) => set("description", value)}
                multiline
              />

              <Text style={[s.title, { marginVertical: 10 }]}>
                Parts and materials
              </Text>

              {form.parts.map((part) => (
                <View
                  key={part.id}
                  style={[
                    s.row,
                    {
                      justifyContent: "space-between",
                      borderTopWidth: 1,
                      borderColor: colors.line,
                      paddingVertical: 8,
                    },
                  ]}
                >
                  <Text style={[s.small, { flex: 1 }]}>
                    {part.name}
                    {" · qty "}
                    {part.quantity}
                    {part.unitCost ? ` · $${part.unitCost}/unit` : ""}
                  </Text>

                  <Button
                    title="Remove"
                    kind="danger"
                    onPress={() => removePart(part.id)}
                  />
                </View>
              ))}

              <Field
                label="Part / material name"
                value={partName}
                onChangeText={setPartName}
              />

              <Field
                label="Quantity"
                value={partQty}
                onChangeText={setPartQty}
                keyboardType="numeric"
              />

              <Field
                label="Unit cost ($)"
                value={partCost}
                onChangeText={setPartCost}
                keyboardType="decimal-pad"
              />

              <Button title="+ Add part" kind="secondary" onPress={addPart} />

              <Text style={[s.title, { marginTop: 16, marginBottom: 8 }]}>
                Job photos
              </Text>

              <Button
                title="+ Upload photos"
                kind="secondary"
                onPress={addPhotos}
              />

              <View style={[s.row, { flexWrap: "wrap", marginTop: 10 }]}>
                {form.photos.map((uri, index) => (
                  <View
                    key={`${uri}-${index}`}
                    style={{ width: 100, marginRight: 8, marginBottom: 10 }}
                  >
                    <Image
                      source={{ uri }}
                      style={{
                        width: 96,
                        height: 96,
                        borderRadius: 10,
                      }}
                    />

                    <Text
                      onPress={() => removePhoto(index)}
                      style={{
                        color: colors.danger,
                        fontSize: 12,
                        marginTop: 5,
                      }}
                    >
                      Remove photo
                    </Text>
                  </View>
                ))}
              </View>

              <View style={[s.row, { flexWrap: "wrap", marginTop: 12 }]}>
                <Button title="Save job" onPress={saveClose} />

                <Button title="Cancel" kind="secondary" onPress={cancel} />

                {isExistingJob && (
                  <Button title="Delete" kind="danger" onPress={deleteJob} />
                )}
              </View>
            </Card>
          </View>
        )}
      </ScrollView>
    </Page>
  );
}
