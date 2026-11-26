import { useRouter } from "expo-router";import { Text, View } from "react-native";
import { Card, colors } from "../../components/ui";
import { useAppData } from "../../context/AppDataContext";

export default function JobsHeading() {
  const { data } = useAppData();
  const router = useRouter();
  const active = data.shifts.filter((x) => !x.clockOut).length;
  const scheduled = data.jobs.filter((x) => x.status === "Scheduled").length;
  const inProgress = data.jobs.filter((x) => x.status === "In progress").length;
  const onHold = data.jobs.filter((x) => x.status === "On hold").length;
  const completed = data.jobs.filter((x) => x.status === "Completed").length;

  return (
    <View style={{ flexDirection: "column", flexWrap: "wrap", gap: 10 }}>
      <Text
        style={{
          color: colors.muted,
          fontSize: 12,
          fontWeight: "800",
          marginVertical: 7,
        }}
      >
        Jobs
      </Text>
      {/* <Card
        key={String("Jobs")}
        style={{ flexDirection: "row", width: "48%", flexGrow: 1, minWidth: 135 }}
      > */}
      {[
        ["completed", completed],
        ["active Jobs", scheduled],
        ["In progress", inProgress],
        ["on hold", onHold],
      ].map(([label, value]) => (
        <Card
        key={String(label)}
          style={{
            width: "35%",
            flexDirection: "row",
            flexWrap: "wrap",
            minWidth: 205,
            gap: 10,
          }}
        >
          <Text
            style={{
              color: colors.muted,
              fontSize: 12,
              fontWeight: "400",
                marginVertical: 3,
            }}
          >
            {label}
          </Text>
          <Text
            style={{
              backgroundColor: colors.accent,
              fontSize: 12,
              fontWeight: "400",
              borderRadius: "90%",
              width: "1.2rem",
              height: "1.2rem",
              textAlign: "center",
              padding: "none",
              margin: "none",
            }}
          >
            {value}
          </Text>
        </Card>
      ))}
      {/* <Tag
        text="View records"
        onPress={() => router.push(`/(tabs)/jobs` as never)}
      /> */}

      <Text
        onPress={() => router.push(`/(tabs)/jobs` as never)}
        style={{
          color: colors.accent,
          fontWeight: "800",
          marginTop: 12,
        }}
      >
        Open →
      </Text>
      {/* </Card> */}
    </View>
  );
}
