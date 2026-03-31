import { AssetInventory } from './AssetInventory';

interface ModuloInventarioProps {
  onAssetClick: (assetId: string) => void;
  onCreateAsset: () => void;
}

export function ModuloInventario({ onAssetClick, onCreateAsset }: ModuloInventarioProps) {
  return (
    <main className="px-6 transition-[padding] duration-300 lg:pl-[var(--content-padding,20rem)] pt-6 lg:pt-8 pb-12 pr-6 lg:pr-12">
      <div className="max-w-[1400px] mx-auto">
        <AssetInventory onAssetClick={onAssetClick} onCreateAsset={onCreateAsset} />
      </div>
    </main>
  );
}