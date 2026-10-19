import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Field, selectClass } from "@/components/shared/ui-bits";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { getTeam } from "@/modules/data/queries";
import { useData } from "@/modules/data/store";
import { TEAM_ROLES, type TeamRole } from "@/modules/data/types";

export function AddMemberSheet({ open, onOpenChange, teamId }: { open: boolean; onOpenChange: (o: boolean) => void; teamId: string }) {
  const { data, upsertMember } = useData();
  const [researcherId, setResearcherId] = useState("");
  const [role, setRole] = useState<TeamRole>("Member");
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (open) { setResearcherId(""); setRole("Member"); setError(null); } }, [open]);

  const memberIds = new Set(data.memberships.filter((m) => m.teamId === teamId).map((m) => m.researcherId));
  const candidates = data.researchers.filter((r) => !memberIds.has(r.id)).sort((a, b) => a.name.localeCompare(b.name));

  const save = () => {
    if (!researcherId) return setError("Choose a researcher to add.");
    const r = data.researchers.find((x) => x.id === researcherId)!;
    upsertMember(teamId, researcherId, role);
    toast.success(`${r.name} added to ${getTeam(data, teamId)?.acronym} as ${role}`);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add team member</SheetTitle>
          <SheetDescription>Researchers can participate in several teams, each with its own role.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-5 py-4">
          <Field label="Researcher" htmlFor="add-researcher" help={`${candidates.length} researchers are not yet in this team.`} error={error}>
            <select id="add-researcher" value={researcherId} onChange={(e) => { setResearcherId(e.target.value); setError(null); }} aria-invalid={!!error} className={`${selectClass} w-full aria-[invalid=true]:border-destructive`}>
              <option value="">Select a researcher…</option>
              {candidates.map((r) => <option key={r.id} value={r.id}>{r.name} - {r.category}{r.status === "inactive" ? " (inactive)" : ""}</option>)}
            </select>
          </Field>
          <Field label="Role in team" htmlFor="add-role" help="The coordinator role is kept by the current coordinator.">
            <select id="add-role" value={role} onChange={(e) => setRole(e.target.value as TeamRole)} className={`${selectClass} w-full`}>
              {TEAM_ROLES.filter((r) => r !== "Coordinator").map((r) => <option key={r}>{r}</option>)}
            </select>
          </Field>
        </div>
        <SheetFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>Add to team</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
