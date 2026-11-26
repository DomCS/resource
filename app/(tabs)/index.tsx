import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { Card, Heading, Page, colors, s } from "../../components/ui";
import { useAppData } from "../../context/AppDataContext";
import JobsHeading from "./jobsHeading";
export default function Overview() {
  const { data } = useAppData();
  // const data = {
  //   customers: [],
  //   employees: [],
  //   jobs: [{status: "Completed"}],
  //   shifts: [{ clockIn: new Date(), clockOut: new Date() }],
  //   inventory: [{id: "xxx", quantity: 0, unit: 1, minimum: 0 , name: "wrench"}],
  // };
  const router = useRouter();
  const active = data.shifts.filter((x) => !x.clockOut).length;
  const openJobs = data.jobs.filter((x) => x.status !== "Completed").length;
  return (
    <Page>
      <Text
        style={{
          color: colors.accent,
          fontWeight: "800",
          letterSpacing: 2,
          fontSize: 11,
          marginBottom: 10,
        }}
      >
        FIELD OPERATIONS / CONTROL CENTER
      </Text>
      <Heading
        title="Good work starts here."
        subtitle="White Oak Plumbing, at a glance."
      />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {[
          ["Customers", data.customers.length, "customers"],
          ["Employees", data.employees.length, "employees"],
          ["Jobs", data.jobs.length, "jobs"],
          ["Inventory", active, "inventory"],
          ["Active shifts", active, "employees"],
        ].map(([label, value, route]) => {
          if (label === "Jobs") {
            return <Card key={String(label)}>{JobsHeading()}</Card>;
          }
          return (
            <Card
              key={String(label)}
              style={{ width: "48%", flexGrow: 1, minWidth: 135 }}
            >
              <Text style={s.muted}>{label}</Text>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 30,
                  fontWeight: "800",
                  marginVertical: 7,
                }}
              >
                {value}
              </Text>
              {/* <Tag text="View records" /> */}
              <Text
                onPress={() => router.push(`/(tabs)/${route}` as never)}
                style={{
                  color: colors.accent,
                  fontWeight: "800",
                  marginTop: 12,
                }}
              >
                Open →
              </Text>
            </Card>
          );
        })}
      </View>
      <Card>
        <Heading title="Quick overview" subtitle="Operational notes" />
        <Text style={s.small}>
          • Records are saved on this device using AsyncStorage
        </Text>
        <Text style={s.small}>
          • Clock sessions are stored as timestamps and totals are calculated
          from those timestamps
        </Text>
        <Text style={s.small}>
          • Add customers, employees, jobs, and stock from their tabs
        </Text>
      </Card>
      <Card>
        <Text style={s.title}>Low stock</Text>
        {data.inventory.filter((i) => i.quantity <= i.minimum).length === 0 ? (
          <Text style={[s.small, { marginTop: 8 }]}>
            No items currently below their minimum quantity.
          </Text>
        ) : (
          data.inventory
            .filter((i) => i.quantity <= i.minimum)
            .map((i) => (
              <Text key={i.id} style={[s.small, { marginTop: 7 }]}>
                {i.name} · {i.quantity} {i.unit} remaining
              </Text>
            ))
        )}
      </Card>
    </Page>
  );
}
