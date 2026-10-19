import { Link } from "@tanstack/react-router";
import { BookOpen, Crown, FolderKanban, Pencil, ShieldCheck, Trash2, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { HBarChart } from "@/components/shared/HBarChart";
import { Avatar, EmptyState, PageHeader, Section, StatusBadge, Tag, fmtDate, selectClass } from "@/components/shared/ui-bits";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { compositionByCategory, coordinatorOf, getTeam, membersOf, projectsForTeam, publicationsForTeam, teamAreaIds, teamSkills, areaName } from "@/modules/data/queries";
import { useData, usePermissions } from "@/modules/data/store";
import { TEAM_ROLES, type TeamRole } from "@/modules/data/types";
import { RefList } from "@/modules/researchers/ResearcherProfile";
import { AddMemberSheet } from "./AddMemberSheet";
import { EditDescriptionDialog } from "./EditDescriptionDialog";

const ROLE_ORDER: Record<TeamRole, number> = { Coordinator: 0, "Senior member": 1, Member: 2, Associate: 3 };

export function TeamDetail({ id }: { id: string }) {
  const { data, hydrated, upsertMember, removeMember, role } = useData();
  const { canManageTeam } = usePermissions();
  const [editDesc, setEditDesc] = useState(false);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<{ id: string; name: string } | null>(null);
  const t = getTeam(data, id);

  if (!hydrated) return <div className="space-y-4"><Skeleton className="h-24 rounded-xl" /><Skeleton className="h-72 rounded-xl" /></div>;
  if (!t) return <div className="surface"><EmptyState icon={Users} title="Team not found" description="This team does not exist in the demo data." action={<Button asChild variant="outline"><Link to="/teams">Back to teams</Link></Button>} /></div>;

  const manage = canManageTeam(t.id);
  const members = membersOf(data, t.id).sort((a, b) => ROLE_ORDER[a.membership.role] - ROLE_ORDER[b.membership.role] || a.researcher.name.localeCompare(b.researcher.name));
  const coord = coordinatorOf(data, t.id);
  const skills = teamSkills(data, t.id);
  const roleData = TEAM_ROLES.map((r) => ({ id: r, label: r, name: r, value: members.filter((m) => m.membership.role === r).length })).filter((d) => d.value);

  return (
    <>
      <PageHeader
        title={t.name}
        description={<>{t.acronym} · {members.length} members · updated {fmtDate(t.updatedAt)}</>}
        actions={manage ? (
          <>
            <Button variant="outline" onClick={() => setEditDesc(true)}><Pencil className="h-4 w-4" /> Edit description</Button>
            <Button onClick={() => setAdding(true)}><UserPlus className="h-4 w-4" /> Add member</Button>
          </>
        ) : (
          <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" /> {role === "coordinator" ? "You coordinate a different team (ISL)" : "Switch demo role to Coordinator to manage ISL"}
          </span>
        )}
      />

      <div className="grid grid-cols-12 gap-4 lg:gap-6">
        <Section className="col-span-12 lg:col-span-8" title="Overview & objectives">
          <p className="text-[15px] leading-relaxed text-foreground">{t.description}</p>
          <ul className="mt-4 space-y-2">
            {t.objectives.map((o) => <li key={o} className="flex gap-2 text-sm text-muted-foreground"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{o}</li>)}
          </ul>
        </Section>
        <Section className="col-span-12 lg:col-span-4" title="Coordinator">
          {coord ? (
            <Link to="/researchers/$id" params={{ id: coord.id }} className="flex items-center gap-3 rounded-xl border border-border p-4 hover:border-primary/40 hover:bg-accent/40">
              <Avatar name={coord.name} size="lg" />
              <span><span className="flex items-center gap-1.5 font-semibold text-foreground"><Crown className="h-4 w-4 text-primary" />{coord.name}</span><span className="text-xs text-muted-foreground">{coord.category}</span></span>
            </Link>
          ) : <p className="text-sm text-destructive">No coordinator assigned.</p>}
          <h3 className="mb-2 mt-5 text-sm font-semibold text-foreground">Research areas present</h3>
          <div className="flex flex-wrap gap-1.5">{teamAreaIds(data, t.id).map((a) => <Link key={a} to="/areas/$id" params={{ id: a }}><Tag tone="teal">{areaName(a)}</Tag></Link>)}</div>
        </Section>

        <Section className="col-span-12" title="Members & roles" description="Removing a member only ends their participation in this team; their profile is kept.">
          {members.length === 0 ? <EmptyState title="No members yet" description="Add researchers to start building this team." action={manage ? <Button onClick={() => setAdding(true)}>Add member</Button> : undefined} /> : (
            <div className="-mx-5 overflow-x-auto md:-mx-6">
              <table className="w-full text-sm">
                <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr><th className="px-5 py-3 font-medium md:px-6">Researcher</th><th className="px-4 py-3 font-medium">Role</th><th className="hidden px-4 py-3 font-medium md:table-cell">Category</th><th className="hidden px-4 py-3 font-medium sm:table-cell">Status</th>{manage && <th className="px-4 py-3"><span className="sr-only">Actions</span></th>}</tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {members.map(({ membership: m, researcher: r }) => {
                    const self = m.role === "Coordinator";
                    return (
                      <tr key={r.id} className="h-14 hover:bg-accent/40">
                        <td className="px-5 py-2 md:px-6"><Link to="/researchers/$id" params={{ id: r.id }} className="flex items-center gap-3 hover:text-primary"><Avatar name={r.name} size="sm" /><span className="font-medium">{r.name}</span></Link></td>
                        <td className="px-4 py-2">
                          {manage && !self ? (
                            <>
                              <label htmlFor={`role-${r.id}`} className="sr-only">Role of {r.name}</label>
                              <select id={`role-${r.id}`} value={m.role} onChange={(e) => { upsertMember(t.id, r.id, e.target.value as TeamRole); toast.success(`${r.name} is now ${e.target.value}`); }} className={`${selectClass} h-9`}>
                                {TEAM_ROLES.filter((x) => x !== "Coordinator").map((x) => <option key={x}>{x}</option>)}
                              </select>
                            </>
                          ) : <Tag tone={self ? "teal" : "neutral"}>{m.role}</Tag>}
                        </td>
                        <td className="hidden px-4 py-2 text-muted-foreground md:table-cell">{r.category}</td>
                        <td className="hidden px-4 py-2 sm:table-cell"><StatusBadge status={r.status} /></td>
                        {manage && <td className="px-4 py-2 text-right">{!self && <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive-soft hover:text-destructive" onClick={() => setRemoving({ id: r.id, name: r.name })} aria-label={`Remove ${r.name} from team`}><Trash2 className="h-4 w-4" /></Button>}</td>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        <Section className="col-span-12 md:col-span-6 lg:col-span-4" title="Roles" description="Members per role in this team.">
          <HBarChart data={roleData} labelWidth={100} unit="members" />
        </Section>
        <Section className="col-span-12 md:col-span-6 lg:col-span-4" title="Academic category">
          <HBarChart data={compositionByCategory(data, members.map((m) => m.researcher)).map((d) => ({ ...d, label: d.label.replace("Postdoctoral", "Postdoc").replace(" Professor", " Prof.") }))} labelWidth={118} unit="members" />
        </Section>
        <Section className="col-span-12 lg:col-span-4" title="Competences present" description="Number = members listing it.">
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 18).map(([s, n]) => <Link key={s} to="/researchers" search={{ q: s, team: t.id }}><Tag>{s}{n > 1 && <span className="ml-1 tabular text-primary">×{n}</span>}</Tag></Link>)}
          </div>
        </Section>

        <Section className="col-span-12 lg:col-span-6" title="Related projects" description="Context only (read-only).">
          <RefList icon={FolderKanban} empty="No related projects." items={projectsForTeam(t.id).map((p) => ({ id: p.id, title: `${p.acronym} - ${p.title}`, meta: p.period }))} />
        </Section>
        <Section className="col-span-12 lg:col-span-6" title="Related publications" description="Context only (read-only).">
          <RefList icon={BookOpen} empty="No related publications." items={publicationsForTeam(t.id).map((p) => ({ id: p.id, title: p.title, meta: `${p.venue}, ${p.year}` }))} />
        </Section>
      </div>

      {manage && (
        <>
          <EditDescriptionDialog open={editDesc} onOpenChange={setEditDesc} team={t} />
          <AddMemberSheet open={adding} onOpenChange={setAdding} teamId={t.id} />
          <AlertDialog open={!!removing} onOpenChange={(o) => !o && setRemoving(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove {removing?.name} from {t.acronym}?</AlertDialogTitle>
                <AlertDialogDescription>This ends their participation in {t.name}. Their researcher profile and other team memberships are kept.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { if (removing) { removeMember(t.id, removing.id); toast.success(`${removing.name} removed from ${t.acronym}`); } setRemoving(null); }}>Remove from team</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </>
  );
}
