"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useCreateSite() {
  return useMutation(api.projects.create);
}
