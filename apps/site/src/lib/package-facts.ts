import pkg from '../../../../packages/react/package.json';
import sizes from '../../../../packages/react/sizes.json';

export const version = pkg.version;
export const reactPeer = pkg.peerDependencies.react.replace('>=', '');
export { sizes };
