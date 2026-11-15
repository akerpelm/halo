import type { BuildConfig } from '../lib/build';
import { Playground } from './playground';

/** The playground as its own surface, with the whole width for building. */
export function PlaygroundPage({ build, onBuild }: { build: BuildConfig; onBuild: (config: BuildConfig) => void }) {
  return (
    <div>
      <Playground build={build} onBuild={onBuild} />
    </div>
  );
}
