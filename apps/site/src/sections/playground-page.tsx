import type { BuildConfig } from '../lib/build';
import { Playground } from './playground';

export function PlaygroundPage({ build, onBuild }: { build: BuildConfig; onBuild: (config: BuildConfig) => void }) {
  return (
    <div>
      <Playground build={build} onBuild={onBuild} />
    </div>
  );
}
