"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n/useI18n";
import type { LeadResultItem } from "@/lib/leads/errors";

interface LeadDetailsDialogProps {
  lead: LeadResultItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadDetailsDialog({ lead, open, onOpenChange }: LeadDetailsDialogProps) {
  const { translate } = useI18n();
  const details = lead?.rawData;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        {lead && (
          <>
            <DialogHeader>
              <DialogTitle>{lead.name}</DialogTitle>
              {(details?.categoryName ?? lead.category) && (
                <DialogDescription>{details?.categoryName ?? lead.category}</DialogDescription>
              )}
            </DialogHeader>

            <div className="flex flex-wrap gap-2">
              {details?.totalScore != null && (
                <Badge variant="secondary">
                  ★ {details.totalScore.toFixed(1)}
                  {details.reviewsCount != null
                    ? ` · ${translate({ id: "leads.details.reviews", values: { count: details.reviewsCount } })}`
                    : ""}
                </Badge>
              )}
              {details?.price && <Badge variant="secondary">{details.price}</Badge>}
              {details?.permanentlyClosed && (
                <Badge variant="destructive">{translate({ id: "leads.details.closedPermanently" })}</Badge>
              )}
              {details?.temporarilyClosed && (
                <Badge variant="destructive">{translate({ id: "leads.details.closedTemporarily" })}</Badge>
              )}
            </div>

            <dl className="flex flex-col gap-3 font-mono text-xs">
              <div>
                <dt className="text-muted-foreground">{translate({ id: "leads.details.address" })}</dt>
                <dd className="mt-0.5 text-foreground">{lead.address ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{translate({ id: "leads.details.phone" })}</dt>
                <dd className="mt-0.5 text-foreground">
                  {lead.phone ? (
                    <a href={`tel:${lead.phone}`} className="underline underline-offset-2 hover:text-primary">
                      {lead.phone}
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              {details?.website && (
                <div>
                  <dt className="text-muted-foreground">{translate({ id: "leads.details.website" })}</dt>
                  <dd className="mt-0.5 truncate text-foreground">
                    <a
                      href={details.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2 hover:text-primary"
                    >
                      {details.website}
                    </a>
                  </dd>
                </div>
              )}
              {details?.openingHours && details.openingHours.length > 0 && (
                <div>
                  <dt className="text-muted-foreground">{translate({ id: "leads.details.hours" })}</dt>
                  <dd className="mt-1 flex flex-col gap-0.5 text-foreground">
                    {details.openingHours.map((entry) => (
                      <span key={entry.day} className="flex justify-between gap-4">
                        <span>{entry.day}</span>
                        <span>{entry.hours}</span>
                      </span>
                    ))}
                  </dd>
                </div>
              )}
              {details?.url && (
                <div>
                  <a
                    href={details.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2"
                  >
                    {translate({ id: "leads.details.mapsLink" })}
                  </a>
                </div>
              )}
            </dl>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
