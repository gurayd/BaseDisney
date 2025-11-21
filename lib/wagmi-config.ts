import { createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { base } from 'wagmi/chains';

const rpcUrl =
  process.env.RPC_URL ||
  base.rpcUrls.default.http[0] ||
  'https://mainnet.base.org';

export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(rpcUrl)
  },
  connectors: [injected({ shimDisconnect: true })],
  ssr: true
});

export { base };
