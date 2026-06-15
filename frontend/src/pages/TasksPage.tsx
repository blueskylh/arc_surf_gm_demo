import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, fetchApi } from "../lib/api";
import { useState } from "react";
import { Clock, CheckCircle, XCircle, AlertCircle, DollarSign } from "lucide-react";
import { toast } from "sonner";

const statusIcons: Record<string, any> = {
  Open: Clock,
  Funded: DollarSign,
  Submitted: AlertCircle,
  Completed: CheckCircle,
  Rejected: XCircle,
  Expired: Clock,
};

const statusColors: Record<string, string> = {
  Open: "text-blue-500",
  Funded: "text-yellow-500",
  Submitted: "text-purple-500",
  Completed: "text-green-500",
  Rejected: "text-red-500",
  Expired: "text-gray-500",
};

export default function TasksPage({ navigate }: { navigate: (path: string) => void }) {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const queryClient = useQueryClient();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["jobs", statusFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      return fetchApi(`jobs?${params}`);
    },
  });

  const fundMutation = useMutation({
    mutationFn: async (jobId: number) => {
      const walletAddress = localStorage.getItem("walletAddress");
      if (!walletAddress) throw new Error("Please connect wallet first");

      return fetchApi(`jobs/${jobId}/fund`, {
        method: "POST",
        body: JSON.stringify({ client_wallet_address: walletAddress }),
      });
    },
    onSuccess: () => {
      toast.success("Job funded successfully!");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const statuses = ["All", "Open", "Funded", "Submitted", "Completed"];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Tasks</h1>

      {/* Status Filter */}
      <div className="flex gap-2">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status === "All" ? "" : status)}
            className={`px-4 py-2 rounded-lg ${
              (status === "All" && !statusFilter) || statusFilter === status
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Jobs List */}
      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="space-y-4">
          {jobs?.map((job: any) => {
            const StatusIcon = statusIcons[job.status] || Clock;
            const statusColor = statusColors[job.status] || "text-gray-500";

            return (
              <div key={job.id} className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <StatusIcon className={statusColor} size={24} />
                      <h3 className="text-lg font-semibold">Job #{job.job_id}</h3>
                      <span className={`px-2 py-1 rounded text-sm ${
                        job.status === "Completed" ? "bg-green-500/10 text-green-500" :
                        job.status === "Funded" ? "bg-yellow-500/10 text-yellow-500" :
                        "bg-secondary"
                      }`}>
                        {job.status}
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-4">{job.description}</p>
                    <div className="flex gap-6 text-sm">
                      <span>Budget: ${job.budget_usdc} USDC</span>
                      <span>Client: {job.client_address.slice(0, 6)}...{job.client_address.slice(-4)}</span>
                      <span>Provider: {job.provider_address.slice(0, 6)}...{job.provider_address.slice(-4)}</span>
                      <span>Created: {new Date(job.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {job.status === "Open" && (
                      <button
                        onClick={() => fundMutation.mutate(job.id)}
                        disabled={fundMutation.isPending}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded"
                      >
                        {fundMutation.isPending ? "Funding..." : "Fund Job"}
                      </button>
                    )}
                    {job.status === "Submitted" && (
                      <button
                        onClick={() => navigate(`/tasks/${job.id}/review`)}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded"
                      >
                        Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
