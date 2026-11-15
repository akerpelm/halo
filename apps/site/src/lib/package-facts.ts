import pkg from '../../../../packages/react/package.json' with { type: 'json' };
import sizes from '../../../../packages/react/sizes.json' with { type: 'json' };

export const version = pkg.version;
export const reactPeer = pkg.peerDependencies.react.replace('>=', '');
export { sizes };
