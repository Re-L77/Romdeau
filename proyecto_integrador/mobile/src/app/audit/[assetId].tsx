import { useLocalSearchParams } from "expo-router";
import AuditDetailScreen from "../../screens/AuditDetailScreen";
import AssetAuditScreen from "../../screens/AssetAuditScreen";

export default function AuditScreen() {
  const { assetId, auditId } = useLocalSearchParams<{
    assetId: string;
    auditId?: string;
  }>();

  const value = assetId || "";
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (uuidRegex.test(value)) {
    return <AuditDetailScreen auditId={value} />;
  }

  return <AssetAuditScreen assetId={value} auditoriaProgramadaId={auditId} />;
}
