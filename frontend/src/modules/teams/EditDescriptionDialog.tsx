import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Field } from "@/components/shared/ui-bits";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { validateDescription } from "@/modules/data/operations";
import { useData } from "@/modules/data/store";
import type { Team } from "@/modules/data/types";

export function EditDescriptionDialog({ open, onOpenChange, team }: { open: boolean; onOpenChange: (o: boolean) => void; team: Team }) {
  const { updateTeamDescription } = useData();
  const [value, setValue] = useState(team.description);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (open) { setValue(team.description); setError(null); } }, [open, team.description]);

  const save = () => {
    const err = validateDescription(value);
    if (err) return setError(err);
    updateTeamDescription(team.id, value);
    toast.success("Team description saved");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit team description</DialogTitle>
          <DialogDescription>Shown on the team page and in team listings.</DialogDescription>
        </DialogHeader>
        <Field label="Description" htmlFor="team-desc" help={`${value.trim().length}/600 characters · minimum 30`} error={error}>
          <textarea id="team-desc" rows={6} value={value} onChange={(e) => { setValue(e.target.value); setError(null); }} aria-invalid={!!error} className="w-full rounded-lg border border-input bg-card p-3 text-sm focus-visible:outline-2 focus-visible:outline-ring aria-[invalid=true]:border-destructive" />
        </Field>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>Save description</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
