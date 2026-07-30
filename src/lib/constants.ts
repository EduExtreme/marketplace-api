import type { ApiCategoryConfig, ApiCategoryId, HttpMethod } from "./types";

export const API_CATEGORIES: Record<ApiCategoryId, ApiCategoryConfig> = {
  dados: { id: "dados", labelKey: "category.dados" },
  financeiro: { id: "financeiro", labelKey: "category.financeiro" },
  geolocalizacao: { id: "geolocalizacao", labelKey: "category.geolocalizacao" },
  comunicacao: { id: "comunicacao", labelKey: "category.comunicacao" },
  utilidades: { id: "utilidades", labelKey: "category.utilidades" },
};

export interface HttpMethodConfig {
  id: HttpMethod;
  className: string;
}

export const HTTP_METHOD_CONFIG: Record<HttpMethod, HttpMethodConfig> = {
  GET: { id: "GET", className: "text-sky-400" },
  POST: { id: "POST", className: "text-amber-400" },
  PUT: { id: "PUT", className: "text-violet-400" },
  PATCH: { id: "PATCH", className: "text-emerald-400" },
  DELETE: { id: "DELETE", className: "text-rose-400" },
};
