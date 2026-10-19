import { Plus, X } from "lucide-react";
import { useEffect, useState, type KeyboardEvent } from "react";
import { toast } from "sonner";
import { Field } from "@/components/shared/ui-bits";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { normalizeSkills, validateSkills } from "@/modules/data/operations";
import { allSkills } from "@/modules/data/queries";
import { useData } from "@/modules/data/store";
import type { Researcher } from "@/modules/data/types";

export function EditSkillsSheet({ open, onOpenChange, researcher }: { open: boolean; onOpenChange: (o: boolean) => void; researcher: Researcher }) {
  const { data, updateSkills } = useData();
  const [skills, setSkills] = useState<string[]>(researcher.skills);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) { setSkills(researcher.skills); setDraft(""); setError(null); }
  }, [open, researcher.skills]);

  const add = () => {
    const v = draft.trim();
    if (!v) return;
    if (v.length > 40) return setError("Each competence must have 40 characters or fewer.");
    if (skills.some((s) => s.toLowerCase() === v.toLowerCase())) return setError(`"${v}" is already listed.`);
    setSkills([...skills, v]);
    setDraft("");
    setError(null);
  };
  const onKey = (e: KeyboardEvent) => { if (e.key === "Enter") { e.preventDefault(); add(); } };

  const save = () => {
    const err = validateSkills(skills);
    if (err) return setError(err);
    updateSkills(researcher.id, normalizeSkills(skills));
    toast.success("Competences updated", { description: "Profile, filters and listings now reflect the change." });
    onOpenChange(false);
  };

  const suggestions = allSkills(data).filter((s) => !skills.includes(s) && draft && s.toLowerCase().includes(draft.toLowerCase())).slice(0, 5);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit competences</SheetTitle>
          <SheetDescription>Competences are searchable across HumanISE.info. Add 1–12 items.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-4 py-4">
          <Field label="Add a competence" htmlFor="skill-input" help="Press Enter to add. Max 40 characters each." error={error}>
            <div className="flex gap-2">
              <input id="skill-input" value={draft} onChange={(e) => { setDraft(e.target.value); setError(null); }} onKeyDown={onKey} aria-invalid={!!error} aria-describedby={error ? "skill-input-error" : "skill-input-help"} placeholder="e.g. Usability testing" className="h-10 flex-1 rounded-lg border border-input bg-card px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring aria-[invalid=true]:border-destructive" />
              <Button type="button" variant="outline" onClick={add}><Plus className="h-4 w-4" /> Add</Button>
            </div>
          </Field>
          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 text-xs">
              <span className="text-muted-foreground">Existing:</span>
              {suggestions.map((s) => <button key={s} type="button" onClick={() => { setSkills([...skills, s]); setDraft(""); }} className="rounded-full border border-border px-2 py-0.5 hover:border-primary hover:text-primary">{s}</button>)}
            </div>
          )}
          <ul className="flex flex-wrap gap-2" aria-label="Current competences">
            {skills.map((s) => (
              <li key={s} className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-accent py-1 pl-3 pr-1 text-sm text-accent-foreground">
                {s}
                <button type="button" onClick={() => setSkills(skills.filter((x) => x !== s))} className="rounded-full p-0.5 hover:bg-primary/10" aria-label={`Remove ${s}`}><X className="h-3.5 w-3.5" /></button>
              </li>
            ))}
            {skills.length === 0 && <li className="text-sm text-muted-foreground">No competences yet.</li>}
          </ul>
        </div>
        <SheetFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>Save changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
