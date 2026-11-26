import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { colors } from "./ui";
import { useAppData } from "../context/AppDataContext";

export default function PageNavigation() {
  const { data, update } = useAppData();
  const router = useRouter();
  const active = data.shifts.filter((x) => !x.clockOut).length;
  const openJobs = data.jobs.filter((x) => x.status !== "Completed").length;

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
      {[
        ["Home", [], "/"],
        ["Customers", data.customers.length, "customers"],
        ["Employees", data.employees.length, "employees"],
        ["Open jobs", openJobs, "jobs"],
        ["Active shifts", active, "employees"],
        ["Inventory", active, "inventory"],
      ].map(([label, value, route]) => (
        <Text key={String(label)}>
          <Text
            onPress={() => router.push(`/(tabs)/${route}` as never)}
            style={{ color: colors.accent, fontWeight: "800", marginTop: 12 }}
          >
            {label}
          </Text>
        </Text>
      ))}
    </View>
  );
}
