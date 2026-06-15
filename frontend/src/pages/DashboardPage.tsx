import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import ReactECharts from "echarts-for-react";

export default function DashboardPage({ navigate }: { navigate: (path: string) => void }) {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => fetch(api("stats")).then(r => r.json()),
  });

  const jobStatusOption = {
    tooltip: { trigger: "item" },
    legend: { orient: "vertical", left: "left" },
    series: [
      {
        name: "Job Status",
        type: "pie",
        radius: "50%",
        data: [
          { value: stats?.jobsByStatus?.Open || 0, name: "Open" },
          { value: stats?.jobsByStatus?.Funded || 0, name: "Funded" },
          { value: stats?.jobsByStatus?.Submitted || 0, name: "Submitted" },
          { value: stats?.jobsByStatus?.Completed || 0, name: "Completed" },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };

  const volumeOption = {
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: stats?.volumeByDay?.map((d: any) => d.date) || [],
    },
    yAxis: { type: "value" },
    series: [
      {
        name: "Volume (USDC)",
        type: "line",
        smooth: true,
        data: stats?.volumeByDay?.map((d: any) => d.volume) || [],
      },
    ],
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="text-muted-foreground mb-2">Total Agents</div>
          <div className="text-3xl font-bold">{stats?.totalAgents || 0}</div>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="text-muted-foreground mb-2">Total Jobs</div>
          <div className="text-3xl font-bold">{stats?.totalJobs || 0}</div>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="text-muted-foreground mb-2">Total Volume</div>
          <div className="text-3xl font-bold">${stats?.totalVolume || 0}</div>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="text-muted-foreground mb-2">Completion Rate</div>
          <div className="text-3xl font-bold">{stats?.completionRate || 0}%</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-lg border border-border">
          <h2 className="text-xl font-bold mb-4">Job Status Distribution</h2>
          <ReactECharts option={jobStatusOption} style={{ height: 300 }} />
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <h2 className="text-xl font-bold mb-4">Trading Volume</h2>
          <ReactECharts option={volumeOption} style={{ height: 300 }} />
        </div>
      </div>
    </div>
  );
}
