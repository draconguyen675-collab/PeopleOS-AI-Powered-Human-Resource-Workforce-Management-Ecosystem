import { useQuery } from "@tanstack/react-query";
import { api, ApiError } from "./api";
import type { Company, Me } from "../types/api";
export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => api<Me>("/auth/me"),
    retry: (count, error) =>
      !(error instanceof ApiError && error.status === 401) && count < 1,
    staleTime: 60_000,
  });
}
export function useCompany() {
  return useQuery({
    queryKey: ["company"],
    queryFn: () => api<Company>("/company"),
  });
}
