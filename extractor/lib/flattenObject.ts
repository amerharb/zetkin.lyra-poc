
export default function flattenObject(
  obj: Record<string, unknown>,
  baseKey: string | null = null,
  flat: Record<string, string> = {}
) {
  Object.entries(obj).forEach(([key, val]) => {
    const combinedKey = baseKey ? `${baseKey}.${key}` : key;
    if (typeof val === 'object') {
      flattenObject(val as Record<string, unknown>, combinedKey, flat);
    } else if (typeof val === 'string') {
      flat[combinedKey] = val;
    }
  });

  return flat;
}