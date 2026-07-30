"use client";

import { useI18n } from "@/lib/i18n/useI18n";
import { HTTP_METHODS, type EndpointDraft } from "@/lib/endpoint-draft";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { HttpMethod } from "@/lib/types";

interface EndpointListEditorProps {
  endpoints: EndpointDraft[];
  onUpdate: (index: number, patch: Partial<EndpointDraft>) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export function EndpointListEditor({ endpoints, onUpdate, onAdd, onRemove }: EndpointListEditorProps) {
  const { translate } = useI18n();

  return (
    <div className="flex flex-col gap-2">
      <Label>{translate({ id: "admin.catalog.endpointsLabel" })}</Label>
      {endpoints.map((endpoint, index) => (
        <div key={index} className="flex items-center gap-2">
          <select
            value={endpoint.method}
            onChange={(event) => onUpdate(index, { method: event.target.value as HttpMethod })}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground sm:w-28"
          >
            {HTTP_METHODS.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
          <Input
            value={endpoint.path}
            onChange={(event) => onUpdate(index, { path: event.target.value })}
            placeholder={translate({ id: "admin.catalog.endpointPathPlaceholder" })}
            className="flex-1"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={endpoints.length === 1}
            onClick={() => onRemove(index)}
          >
            {translate({ id: "admin.catalog.removeEndpoint" })}
          </Button>
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" className="self-start" onClick={onAdd}>
        {translate({ id: "admin.catalog.addEndpoint" })}
      </Button>
    </div>
  );
}
