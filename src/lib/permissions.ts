export function permissionGranted(grants: string[], permission: string) {
  return grants.some((grant) => grant === "*" || grant === permission || (grant.endsWith(".*") && permission.startsWith(grant.slice(0, -1))) || (grant === "*.view" && permission.endsWith(".view")));
}
