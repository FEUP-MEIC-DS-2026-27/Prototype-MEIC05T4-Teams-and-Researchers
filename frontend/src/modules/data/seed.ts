/**
 * DEMO DATA - fictitious records for the HumanISE.info prototype.
 * Names, bios and references are invented and do not describe real people.
 */
import type {
  AcademicCategory,
  Dataset,
  Membership,
  ResearchArea,
  Researcher,
  Team,
  TeamRole,
} from "./types";

export const AREAS: ResearchArea[] = [
  { id: "hci", name: "Human-Computer Interaction", description: "Design and evaluation of interactive systems centred on people." },
  { id: "se", name: "Software Engineering", description: "Methods and tools for building reliable, maintainable software." },
  { id: "is", name: "Information Systems", description: "Organisational information, process modelling and enterprise systems." },
  { id: "ai", name: "Intelligent Systems", description: "Machine learning, reasoning and conversational agents." },
  { id: "dv", name: "Data Science & Visualization", description: "Data analysis pipelines and visual analytics." },
  { id: "dh", name: "Digital Health", description: "Technology supporting care, wellbeing and clinical work." },
];

const T = (
  id: string,
  acronym: string,
  name: string,
  description: string,
  objectives: string[],
  areaIds: string[],
  updatedAt: string,
): Team => ({ id, acronym, name, description, objectives, areaIds, updatedAt });

const TEAMS: Team[] = [
  T("isl", "ISL", "Interactive Systems Lab",
    "Studies how people interact with digital systems and designs accessible, engaging interfaces for everyday and professional contexts.",
    ["Advance participatory and inclusive design methods", "Build evaluation toolkits for interactive prototypes", "Transfer UX research into partner products"],
    ["hci", "dv"], "2026-09-12"),
  T("seq", "SEQ", "Software Engineering & Quality",
    "Researches software development practices, testing automation and model-driven engineering for dependable systems.",
    ["Improve automated testing of complex software", "Support evolution of legacy systems", "Promote empirical software engineering"],
    ["se", "ai"], "2026-08-30"),
  T("isd", "ISD", "Information Systems & Data",
    "Works on enterprise information systems, data governance and analytics that help organisations make informed decisions.",
    ["Model organisational processes and data flows", "Develop data quality and governance frameworks"],
    ["is", "dv"], "2026-06-04"),
  T("ias", "IAS", "Intelligent Assistants",
    "Develops conversational and recommender systems that collaborate with people while remaining transparent and explainable.",
    ["Design explainable conversational agents", "Study human–AI collaboration in knowledge work"],
    ["ai", "hci"], "2026-09-28"),
  T("dhw", "DHW", "Digital Health & Wellbeing",
    "Creates and evaluates technologies for clinical workflows, remote monitoring and personal wellbeing with healthcare partners.",
    ["Co-design tools with clinicians and patients", "Evaluate digital interventions in real settings"],
    ["dh", "hci", "ai"], "2025-07-15"),
];

type R = [id: string, name: string, category: AcademicCategory, affiliation: string, areas: string[], skills: string[], status: "active" | "inactive", updatedAt: string, bio?: string];

const RAW: R[] = [
  ["r01", "Helena Vasconcelos", "Full Professor", "Faculty of Engineering, University of Porto", ["hci", "dv"], ["Participatory design", "Usability evaluation", "Accessibility", "Mixed methods"], "active", "2026-09-10"],
  ["r02", "Tiago Moreira", "Associate Professor", "Faculty of Engineering, University of Porto", ["se", "ai"], ["Software testing", "Model-driven engineering", "Search-based SE"], "active", "2026-08-21"],
  ["r03", "Inês Carvalho", "Associate Professor", "INESC TEC", ["is", "dv"], ["Process mining", "Data governance", "BPMN", "SQL"], "active", "2026-05-30"],
  ["r04", "Rui Fonseca", "Senior Researcher", "INESC TEC", ["ai", "hci"], ["Conversational agents", "NLP", "Explainable AI"], "active", "2026-09-25"],
  ["r05", "Marta Lopes", "Assistant Professor", "Faculty of Engineering, University of Porto", ["dh", "hci"], ["Co-design", "Clinical workflows", "Qualitative research"], "active", "2025-06-18"],
  ["r06", "André Pinto", "Postdoctoral Researcher", "INESC TEC", ["hci", "dv"], ["Information visualization", "D3.js", "Eye tracking"], "active", "2026-07-02"],
  ["r07", "Beatriz Sousa", "PhD Student", "Faculty of Engineering, University of Porto", ["hci"], ["Accessibility", "Screen readers", "User studies"], "active", "2026-09-01"],
  ["r08", "Carlos Mendes", "Assistant Professor", "Faculty of Engineering, University of Porto", ["se"], ["Continuous integration", "DevOps", "Software architecture"], "active", "2026-04-12"],
  ["r09", "Daniela Rocha", "PhD Student", "INESC TEC", ["se", "ai"], ["Test generation", "Large language models", "Python"], "active", "2026-09-19"],
  ["r10", "Eduardo Silva", "Research Assistant", "INESC TEC", ["is"], ["ETL pipelines"], "active", "2025-03-08", ""],
  ["r11", "Filipa Antunes", "Senior Researcher", "INESC TEC", ["is", "dv"], ["Data quality", "Dashboards", "Statistics"], "active", "2026-08-11"],
  ["r12", "Gonçalo Teixeira", "PhD Student", "Faculty of Engineering, University of Porto", ["ai"], ["Recommender systems", "PyTorch", "Evaluation metrics"], "active", "2026-06-27"],
  ["r13", "Joana Ribeiro", "Postdoctoral Researcher", "INESC TEC", ["ai", "hci"], ["Human–AI collaboration", "Interaction design", "Prompt design"], "active", "2026-09-05"],
  ["r14", "Luís Barbosa", "Full Professor", "Faculty of Engineering, University of Porto", ["dh", "ai"], ["Medical informatics", "Interoperability", "HL7 FHIR"], "active", "2026-02-14"],
  ["r15", "Mariana Costa", "PhD Student", "INESC TEC", ["dh"], ["Remote monitoring", "Wearables", "Signal processing"], "active", "2026-08-03"],
  ["r16", "Nuno Ferreira", "Research Assistant", "INESC TEC", ["dh", "hci"], ["Mobile development", "Flutter"], "active", "2025-05-22"],
  ["r17", "Patrícia Gomes", "Assistant Professor", "Faculty of Engineering, University of Porto", ["is", "se"], ["Requirements engineering", "Enterprise architecture", "Archimate"], "active", "2026-07-19"],
  ["r18", "Ricardo Almeida", "PhD Student", "Faculty of Engineering, University of Porto", ["se"], ["Static analysis", "Refactoring", "Java"], "inactive", "2024-11-30"],
  ["r19", "Sofia Martins", "Postdoctoral Researcher", "INESC TEC", ["dv", "ai"], ["Visual analytics", "Machine learning", "R"], "active", "2026-09-14"],
  ["r20", "Vasco Oliveira", "Senior Researcher", "INESC TEC", ["hci", "dh"], ["Serious games", "Behaviour change", "Unity"], "active", "2026-03-09"],
  ["r21", "Rita Nogueira", "PhD Student", "INESC TEC", ["is"], ["Process modelling", "Knowledge graphs"], "active", "2026-05-16"],
  ["r22", "Miguel Cunha", "Research Assistant", "Faculty of Engineering, University of Porto", ["ai"], [], "active", "2026-01-20", ""],
  ["r23", "Ana Brandão", "Associate Professor", "Faculty of Engineering, University of Porto", ["hci", "is"], ["Information architecture", "Card sorting", "Service design"], "inactive", "2025-02-02"],
  ["r24", "Pedro Saraiva", "PhD Student", "INESC TEC", ["dh", "dv"], ["Clinical data analysis", "Time series"], "active", "2026-09-22"],
];

const bioFor = (name: string, cat: string, areas: string[]) =>
  `${name.split(" ")[0] ?? name} is a ${cat.toLowerCase()} working on ${areas
    .map((a) => AREAS.find((x) => x.id === a)?.name.toLowerCase())
    .join(" and ")}, collaborating across HumanISE teams on applied research with academic and industry partners.`;

const RESEARCHERS: Researcher[] = RAW.map(([id, name, category, affiliation, areaIds, skills, status, updatedAt, bio]) => ({
  id,
  name,
  category,
  affiliation,
  email: `${(name.split(" ")[0] ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}@demo.humanise.info`,
  bio: bio ?? bioFor(name, category, areaIds),
  areaIds,
  skills,
  status,
  source: id === "r10" || id === "r22" ? "Self-reported (demo)" : "Institutional repository (demo)",
  updatedAt,
}));

const M = (researcherId: string, teamId: string, role: TeamRole): Membership => ({ researcherId, teamId, role });

const MEMBERSHIPS: Membership[] = [
  M("r01", "isl", "Coordinator"), M("r06", "isl", "Senior member"), M("r07", "isl", "Member"), M("r20", "isl", "Senior member"), M("r23", "isl", "Associate"), M("r13", "isl", "Associate"), M("r19", "isl", "Member"),
  M("r02", "seq", "Coordinator"), M("r08", "seq", "Senior member"), M("r09", "seq", "Member"), M("r18", "seq", "Member"), M("r17", "seq", "Associate"),
  M("r03", "isd", "Coordinator"), M("r11", "isd", "Senior member"), M("r10", "isd", "Member"), M("r21", "isd", "Member"), M("r17", "isd", "Senior member"), M("r19", "isd", "Associate"),
  M("r04", "ias", "Coordinator"), M("r13", "ias", "Senior member"), M("r12", "ias", "Member"), M("r22", "ias", "Member"), M("r09", "ias", "Associate"),
  M("r14", "dhw", "Coordinator"), M("r05", "dhw", "Senior member"), M("r15", "dhw", "Member"), M("r16", "dhw", "Member"), M("r24", "dhw", "Member"), M("r20", "dhw", "Associate"), M("r04", "dhw", "Associate"),
];

export const SEED: Dataset = {
  researchers: RESEARCHERS,
  teams: TEAMS,
  memberships: MEMBERSHIPS,
};
