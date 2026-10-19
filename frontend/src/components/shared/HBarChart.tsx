import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface BarDatum { id: string; label: string; name: string; value: number }

/** Horizontal bar chart. Values are people counts. */
export function HBarChart({ data, onSelect, unit = "researchers", labelWidth = 120, height }: { data: BarDatum[]; onSelect?: (d: BarDatum) => void; unit?: string; labelWidth?: number; height?: number }) {
  const h = height ?? Math.max(160, data.length * 40 + 30);
  return (
    <div style={{ height: h }} role="img" aria-label={data.map((d) => `${d.name}: ${d.value} ${unit}`).join("; ")}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 0 }}>
          <CartesianGrid horizontal={false} stroke="var(--color-border)" />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="label" width={labelWidth} tick={{ fontSize: 12, fill: "var(--color-foreground)" }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: "var(--color-accent)" }}
            formatter={(v: number) => [`${v} ${unit}`, ""]}
            labelFormatter={(l, p) => p?.[0]?.payload?.name ?? l}
            contentStyle={{ borderRadius: 10, border: "1px solid var(--color-border)", fontSize: 12 }}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18} onClick={(d) => onSelect?.(d as unknown as BarDatum)} className={onSelect ? "cursor-pointer" : ""}>
            {data.map((d, i) => (
              <Cell key={d.id} fill={i === 0 ? "var(--color-primary)" : "var(--color-chart-3)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
