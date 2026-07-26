export function truncateAddress(address: string, prefix = 4, suffix = 4): string {
  if (address.length <= prefix + suffix) return address;
  return `${address.slice(0, prefix)}...${address.slice(-suffix)}`;
}
