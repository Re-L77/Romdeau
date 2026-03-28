import { useLocalSearchParams } from "expo-router";
import AssetAuditScreen from "../../screens/AssetAuditScreen";

export default function AuditScreen() {
  const { assetId } = useLocalSearchParams<{ assetId: string }>();

  return <AssetAuditScreen assetId={assetId || ""} />;
}
