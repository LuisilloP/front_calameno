const parseCentralLocationId = () => {
  const raw =
    process.env.NEXT_PUBLIC_CENTRAL_LOCATION_ID ??
    process.env.NEXT_PUBLIC_DEFAULT_LOCATION_ID ??
    "1";

  const parsed = Number(raw);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }

  console.warn(
    "[warehouse-config] ID de bodega central invalido, usando 1 como valor por defecto."
  );
  return 1;
};

const resolveCentralLocationName = () => {
  const raw = process.env.NEXT_PUBLIC_CENTRAL_LOCATION_NAME ?? "";
  const trimmed = raw.trim();
  if (trimmed) {
    return trimmed;
  }
  return "Bodega Calameno";
};

export const CENTRAL_LOCATION_ID = parseCentralLocationId();
export const CENTRAL_LOCATION_NAME = resolveCentralLocationName();

