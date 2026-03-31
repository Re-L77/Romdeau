import { useLocalSearchParams } from "expo-router";
import AuditDetailScreen from "../../screens/AuditDetailScreen";

export default function AuditScreen() {
  const { assetId } = useLocalSearchParams<{ assetId: string }>();

  return <AuditDetailScreen auditId={assetId || ""} />;
}
