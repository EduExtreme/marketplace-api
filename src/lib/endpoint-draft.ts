import type { HttpMethod } from "@/lib/types";

export interface EndpointDraft {
  method: HttpMethod;
  path: string;
}

export const EMPTY_ENDPOINT: EndpointDraft = { method: "GET", path: "" };

export const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];
