import { AssetInventory } from './AssetInventory';

interface ModuloInventarioProps {
  onAssetClick: (assetId: string) => void;
  onCreateAsset: () => void;
}

export function ModuloInventario({ onAssetClick, onCreateAsset }: ModuloInventarioProps) {
  return (
    <main className="px-6 lg:pl-80 pt-6 lg:pt-8 pb-12 pr-6 lg:pr-12">
      <div className="max-w-[1400px] mx-auto">
        <AssetInventory onAssetClick={onAssetClick} onCreateAsset={onCreateAsset} />
      </div>
    </main>
  );
}