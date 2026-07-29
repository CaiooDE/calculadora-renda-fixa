import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompactCurrency, formatCurrency } from "../lib/format";

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;

  return (
    <div className="chart-tooltip">
      <span>{point?.label ?? label}</span>
      <div>
        <i className="dot balance-dot" />
        <small>Patrimônio</small>
        <strong>{formatCurrency(point?.balance ?? 0)}</strong>
      </div>
      <div>
        <i className="dot invested-dot" />
        <small>Total aportado</small>
        <strong>{formatCurrency(point?.invested ?? 0)}</strong>
      </div>
    </div>
  );
}

export default function ProjectionChart({ data }) {
  return (
    <div className="chart-wrap" aria-label="Gráfico da evolução do patrimônio">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#49d6a4" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#49d6a4" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,.065)" />
          <XAxis
            dataKey="month"
            tickFormatter={(month) =>
              month === 0 ? "Hoje" : month < 12 ? `${month}m` : `${Math.round(month / 12)}a`
            }
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#7f8a97", fontSize: 11 }}
            minTickGap={28}
          />
          <YAxis
            tickFormatter={formatCompactCurrency}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#7f8a97", fontSize: 11 }}
            width={68}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ stroke: "#8af0c9", strokeWidth: 1, strokeDasharray: "4 4" }}
          />
          <Area
            type="monotone"
            dataKey="balance"
            stroke="#49d6a4"
            strokeWidth={2.5}
            fill="url(#balanceFill)"
            animationDuration={450}
          />
          <Area
            type="monotone"
            dataKey="invested"
            stroke="#6c7a8b"
            strokeWidth={1.5}
            strokeDasharray="5 5"
            fill="transparent"
            animationDuration={450}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
