import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

import { Alert, Text, View } from "react-native";
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
import { Employee, uid } from "../../lib/types";
const blank = (): Employee => ({
  id: uid(),
  employeeNumber: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
});

const dateKey = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const monday = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
};
const duration = (shift: Shift, now: number) =>
  Math.max(
    0,
    (new Date(shift.clockOut || now).getTime() -
      new Date(shift.clockIn).getTime()) /
      3600000,
  );
const fmt = (n: number) => `${Math.floor(n)}h ${Math.floor((n % 1) * 60)}m`;
export default function Employees() {
  const { data, update } = useAppData();
  const router = useRouter();
  const active = data.shifts.filter((x) => !x.clockOut).length;
  const openJobs = data.jobs.filter((x) => x.status !== "Completed").length;
  const [form, setForm] = useState<Employee | null>(null);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const save = () => {
    if (!form) return;
    if (!form.firstName.trim() || !form.lastName.trim()) {
      Alert.alert("Name required", "Enter the employee first and last name.");
      return;
    }
    update((d) => ({
      ...d,
      employees: d.employees.some((e) => e.id === form.id)
        ? d.employees.map((e) => (e.id === form.id ? form : e))
        : [form, ...d.employees],
    }));
    setForm(null);
  };
  const punch = (e: Employee, clockIn: boolean) => {
    const open = data.shifts.find((x) => x.employeeId === e.id && !x.clockOut);
    if (clockIn) {
      if (open) {
        Alert.alert(
          "Already clocked in",
          "Clock out of the current shift before starting another.",
        );
        return;
      }
      const shift: Shift = {
        id: uid(),
        employeeId: e.id,
        clockIn: new Date().toISOString(),
      };
      update((d) => ({ ...d, shifts: [shift, ...d.shifts] }));
    } else {
      if (!open) {
        Alert.alert(
          "No active shift",
          "This employee is not currently clocked in.",
        );
        return;
      }
      update((d) => ({
        ...d,
        shifts: d.shifts.map((x) =>
          x.id === open.id ? { ...x, clockOut: new Date().toISOString() } : x,
        ),
      }));
    }
  };
  return (
    <Page>
      <Heading
        title="Employees"
        subtitle="Time clock, weekly totals, and employee records"
      />
      {/* <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {[
          ["Home", [], "/"],
          ["Customers", data.customers.length, "customers"],
          ["Employees", data.employees.length, "employees"],
          ["Open jobs", openJobs, "jobs"],
          ["Active shifts", active, "employees"],
          ["Inventory", active, "inventory"],
        ].map(([label, value, route]) => (
          <>
            <Text
              onPress={() => router.push(`/(tabs)/${route}` as never)}
              style={{ color: colors.accent, fontWeight: "800", marginTop: 12 }}
            >
              {label}
            </Text>
          </>
        ))}
      </View> */}

      {PageNavigation()}
      <Button title="＋ Add employee" onPress={() => setForm(blank())} />
      {form && (
        <Card>
          <Text style={s.title}>
            {data.employees.some((e) => e.id === form.id)
              ? "Edit employee"
              : "New employee"}
          </Text>
          <View style={s.row}>
            <Field
              label="First name"
              value={form.firstName}
              onChangeText={(v) => setForm({ ...form, firstName: v })}
            />
            <Field
              label="Last name"
              value={form.lastName}
              onChangeText={(v) => setForm({ ...form, lastName: v })}
            />
          </View>
          <Field
            label="Employee ID number"
            value={form.employeeNumber}
            onChangeText={(v) => setForm({ ...form, employeeNumber: v })}
          />
          <Field
            label="Email"
            value={form.email}
            onChangeText={(v) => setForm({ ...form, email: v })}
            keyboardType="email-address"
          />
          <Field
            label="Phone"
            value={form.phone}
            onChangeText={(v) => setForm({ ...form, phone: v })}
            keyboardType="phone-pad"
          />
          <Field
            label="Home address"
            value={form.address}
            onChangeText={(v) => setForm({ ...form, address: v })}
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
      {data.employees.map((e) => {
        const shifts = data.shifts.filter((x) => x.employeeId === e.id);
        const open = shifts.find((x) => !x.clockOut);
        const weekStart = monday(new Date());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        const thisWeek = shifts.filter((x) => {
          const d = new Date(x.clockIn);
          return d >= weekStart && d < weekEnd;
        });
        const weekly = thisWeek.reduce((sum, x) => sum + duration(x, now), 0);
        const days = [...new Set(shifts.map((x) => dateKey(x.clockIn)))]
          .sort()
          .reverse();
        return (
          <Card key={e.id}>
            <View style={[s.row, { justifyContent: "space-between" }]}>
              <View style={{ flex: 1 }}>
                <Text style={s.title}>
                  {e.firstName} {e.lastName}
                </Text>
                <Text style={s.small}>
                  ID: {e.employeeNumber || "Not assigned"} ·{" "}
                  {e.phone || "No phone"}
                </Text>
              </View>
              <Tag
                text={open ? "CLOCKED IN" : "CLOCKED OUT"}
                color={open ? colors.accent : colors.muted}
              />
            </View>
            <Text style={[s.small, { marginTop: 7 }]}>
              {e.email || "No email"}
              {e.address ? ` · ${e.address}` : ""}
            </Text>
            <View style={[s.row, { marginTop: 12 }]}>
              <Button title="Clock in" onPress={() => punch(e, true)} />
              <Button
                title="Clock out"
                kind="secondary"
                onPress={() => punch(e, false)}
              />
              <Button
                title="Edit information"
                kind="ghost"
                onPress={() => setForm({ ...e })}
              />
            </View>
            {open && (
              <View
                style={{
                  backgroundColor: "#0d2e2a",
                  padding: 12,
                  borderRadius: 10,
                  marginBottom: 10,
                }}
              >
                <Text style={{ color: colors.accent, fontWeight: "800" }}>
                  ACTIVE SHIFT · {fmt(duration(open, now))}
                </Text>
                <Text style={s.small}>
                  Started {new Date(open.clockIn).toLocaleTimeString()}
                </Text>
              </View>
            )}
            <Text style={[s.title, { marginTop: 6 }]}>This week · Mon–Sun</Text>
            <Text
              style={{
                fontSize: 23,
                color: colors.accent,
                fontWeight: "800",
                marginVertical: 6,
              }}
            >
              {fmt(weekly)}
            </Text>
            <Text style={s.small}>
              {weekStart.toLocaleDateString()} –{" "}
              {new Date(weekEnd.getTime() - 86400000).toLocaleDateString()}
            </Text>
            <Text style={[s.title, { marginTop: 14, marginBottom: 6 }]}>
              Daily time entries
            </Text>
            {days.length === 0 ? (
              <Text style={s.small}>No shifts recorded yet.</Text>
            ) : (
              days.map((day) => {
                const entries = shifts.filter(
                  (x) => dateKey(x.clockIn) === day,
                );
                const total = entries.reduce(
                  (sum, x) => sum + duration(x, now),
                  0,
                );
                return (
                  <View
                    key={day}
                    style={{
                      borderTopWidth: 1,
                      borderColor: colors.line,
                      paddingTop: 8,
                      marginTop: 5,
                    }}
                  >
                    <View style={[s.row, { justifyContent: "space-between" }]}>
                      <Text style={s.small}>{day}</Text>
                      <Text style={{ color: colors.text, fontWeight: "800" }}>
                        {fmt(total)}
                      </Text>
                    </View>
                    {entries.map((x) => (
                      <Text key={x.id} style={s.small}>
                        In {new Date(x.clockIn).toLocaleTimeString()} ·{" "}
                        {x.clockOut
                          ? `Out ${new Date(x.clockOut).toLocaleTimeString()}`
                          : "Still clocked in"}{" "}
                        · {fmt(duration(x, now))}
                      </Text>
                    ))}
                  </View>
                );
              })
            )}
          </Card>
        );
      })}
      {data.employees.length === 0 && !form ? (
        <Card>
          <Text style={s.small}>
            Add an employee to enable time clock entries and weekly reporting.
          </Text>
        </Card>
      ) : null}
    </Page>
  );
}
