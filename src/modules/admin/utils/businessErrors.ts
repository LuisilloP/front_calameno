import { QueryClient } from "@tanstack/react-query";
import { normalizeApiError } from "@/modules/admin/api/client";
import { AdminToast } from "@/modules/admin/components/AdminToastProvider";

type ToastFn = (toast: AdminToast) => void;

type BusinessErrorOptions = {
  duplicateMessage: string;
  notFoundMessage?: string;
  genericMessage?: string;
  queryClient: QueryClient;
  queryKey: string;
  pushToast: ToastFn;
  setFormError?: (message: string) => void;
  setBanner?: (message: string) => void;
};

export type BusinessErrorKind =
  | "duplicate"
  | "not_found"
  | "generic";

export const handleBusinessError = async (
  error: unknown,
  {
    duplicateMessage,
    notFoundMessage = "El registro ya no existe. Refrescamos la tabla.",
    genericMessage = "No se pudo completar la operacion",
    queryClient,
    queryKey,
    pushToast,
    setFormError,
    setBanner,
  }: BusinessErrorOptions
): Promise<BusinessErrorKind> => {
  const parsed = normalizeApiError(error);

  if (
    parsed.status === 400 &&
    typeof parsed.code === "string" &&
    parsed.code.endsWith("_duplicate")
  ) {
    setFormError?.(duplicateMessage);
    pushToast({
      tone: "warning",
      message: duplicateMessage,
    });
    return "duplicate";
  }

  if (
    typeof parsed.code === "string" &&
    parsed.code.endsWith("_not_found")
  ) {
    pushToast({
      tone: "info",
      message: notFoundMessage,
    });
    await queryClient.invalidateQueries({
      queryKey: [queryKey],
    });
    return "not_found";
  }

  setBanner?.(genericMessage);
  return "generic";
};
