import { Link } from "@tanstack/react-router";
import { BookOpen, Database, FolderKanban, Mail, Pencil, UserX } from "lucide-react";
import { useState } from "react";
import { Avatar, EmptyState, Section, StatusBadge, Tag, fmtDate } from "@/components/shared/ui-bits";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { areaName, getResearcher, getTeam, membershipsOf, projectsForResearcher, publicationsForResearcher } from "@/modules/data/queries";
import { useData, usePermissions } from "@/modules/data/store";
import { EditSkillsSheet } from "./EditSkillsSheet";

export function ResearcherProfile({ id }: { id: string }) {
  const { data, hydrated } = useData();
  const { canEditResearcher } = usePermissions();
  const [editing, setEditing] = useState(false);
  const r = getResearcher(data, id);

  if (!hydrated) return <div className="space-y-4"><Skeleton className="h-32 rounded-xl" /><Skeleton className="h-64 rounded-xl" /></div>;
  if (!r)
    return (
      <div className="surface">
        <EmptyState icon={UserX} title="Researcher not found" description="This profile does not exist or was removed from the demo data." action={<Button asChild variant="outline"><Link to="/researchers">Back to researchers</Link></Button>} />
      </div>
    );

  const ms = membershipsOf(data, r.id);
  const projects = projectsForResearcher(r.id);
  const pubs = publicationsForResearcher(r.id);
  const editable = canEditResearcher(r.id);

  return (
    <>
      <div className="surface mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center md:p-6">
        <Avatar name={r.name} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-[28px]">{r.name}</h1>
            <StatusBadge status={r.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{r.category} · {r.affiliation}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="h-3.5 w-3.5" /> {r.email}</p>
        </div>
        {editable ? (
          <Button onClick={() => setEditing(true)}><Pencil className="h-4 w-4" /> Edit competences</Button>
        ) : (
          <p className="max-w-[220px] text-xs text-muted-foreground sm:text-right">Switch to the <strong>Researcher</strong> demo role as André Pinto to edit your own profile.</p>
        )}
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="teams">Teams <span className="ml-1 tabular text-muted-foreground">{ms.length}</span></TabsTrigger>
          <TabsTrigger value="work">Projects & publications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="grid grid-cols-12 gap-4 lg:gap-6">
          <Section className="col-span-12 lg:col-span-8" title="Biography">
            {r.bio ? <p className="text-[15px] leading-relaxed text-foreground">{r.bio}</p> : <p className="text-sm text-warning">No biography provided yet.</p>}
          </Section>
          <Section className="col-span-12 lg:col-span-4" title="Record information">
            <dl className="space-y-3 text-sm">
              <div><dt className="text-xs text-muted-foreground">Source</dt><dd className="flex items-center gap-1.5 text-foreground"><Database className="h-3.5 w-3.5 text-primary" /> {r.source}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Last updated</dt><dd className="text-foreground tabular">{fmtDate(r.updatedAt)}</dd></div>
            </dl>
          </Section>
          <Section className="col-span-12 lg:col-span-6" title="Research areas">
            <div className="flex flex-wrap gap-2">
              {r.areaIds.map((a) => <Link key={a} to="/areas/$id" params={{ id: a }}><Tag tone="teal">{areaName(a)}</Tag></Link>)}
            </div>
          </Section>
          <Section className="col-span-12 lg:col-span-6" title="Competences" actions={editable ? <Button variant="ghost" size="sm" onClick={() => setEditing(true)}><Pencil className="h-3.5 w-3.5" /> Edit</Button> : undefined}>
            {r.skills.length ? (
              <div className="flex flex-wrap gap-2">{r.skills.map((s) => <Link key={s} to="/researchers" search={{ q: s }}><Tag>{s}</Tag></Link>)}</div>
            ) : <p className="text-sm text-warning">No competences listed.</p>}
          </Section>
        </TabsContent>

        <TabsContent value="teams">
          <Section title="Team participation" description="A researcher can belong to several teams with a different role in each.">
            {ms.length === 0 ? <EmptyState title="No team participation" description="This researcher is not linked to any team yet. A team coordinator can add them." /> : (
              <ul className="grid gap-3 md:grid-cols-2">
                {ms.map((m) => {
                  const t = getTeam(data, m.teamId)!;
                  return (
                    <li key={m.teamId}>
                      <Link to="/teams/$id" params={{ id: t.id }} className="flex items-center gap-3 rounded-xl border border-border p-4 transition-colors hover:border-primary/40 hover:bg-accent/40">
                        <span className="flex h-10 w-12 items-center justify-center rounded-lg bg-accent text-xs font-semibold text-accent-foreground">{t.acronym}</span>
                        <span className="min-w-0 flex-1"><span className="block font-medium text-foreground">{t.name}</span><span className="text-xs text-muted-foreground">Role: {m.role}</span></span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>
        </TabsContent>

        <TabsContent value="work" className="grid gap-4 lg:grid-cols-2 lg:gap-6">
          <Section title="Projects" description="Read-only reference from the projects area.">
            <RefList icon={FolderKanban} empty="No associated projects." items={projects.map((p) => ({ id: p.id, title: `${p.acronym} - ${p.title}`, meta: `${p.period} · ${getTeam(data, p.teamId)?.acronym}` }))} />
          </Section>
          <Section title="Publications" description="Read-only reference from the publications area.">
            <RefList icon={BookOpen} empty="No associated publications." items={pubs.map((p) => ({ id: p.id, title: p.title, meta: `${p.venue}, ${p.year}` }))} />
          </Section>
        </TabsContent>
      </Tabs>

      {editable && <EditSkillsSheet open={editing} onOpenChange={setEditing} researcher={r} />}
    </>
  );
}

export function RefList({ items, icon: Icon, empty }: { items: { id: string; title: string; meta: string }[]; icon: typeof BookOpen; empty: string }) {
  if (!items.length) return <p className="text-sm text-muted-foreground">{empty}</p>;
  return (
    <ul className="space-y-3">
      {items.map((i) => (
        <li key={i.id} className="flex gap-3">
          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          <span><span className="block text-sm text-foreground">{i.title}</span><span className="text-xs text-muted-foreground">{i.meta}</span></span>
        </li>
      ))}
    </ul>
  );
}
