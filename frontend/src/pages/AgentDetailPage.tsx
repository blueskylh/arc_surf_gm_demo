import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, fetchApi } from "../lib/api";
import { useState } from "react";
import { Bot, Star, Briefcase, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function AgentDetailPage({ navigate }: { navigate: (path: string) => void }) {
  const agentId = window.location.pathname.split("/").pop();
  const queryClient = useQueryClient();
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [jobDescription, setJobDescription] = useState("");

  const { data: agent, isLoading } = useQuery({
    queryKey: ["agent", agentId],
    queryFn: () => fetchApi(`agents/${agentId}`),
  });

  const createJobMutation = useMutation({
    mutationFn: async (serviceId: number) => {
      const walletAddress = localStorage.getItem("walletAddress");
      if (!walletAddress) throw new Error("Please connect wallet first");

      return fetchApi("jobs", {
        method: "POST",
        body: JSON.stringify({
          service_id: serviceId,
          client_wallet_address: walletAddress,
          provider_address: agent.wallet_address,
          description: jobDescription,
          budget_usdc: agent.services.find((s: any) => s.id === serviceId)?.price_usdc,
        }),
      });
    },
    onSuccess: () => {
      toast.success("Job created successfully!");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setShowCreateJob(false);
      setJobDescription("");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (!agent) return <div>Agent not found</div>;

  return (
    <div className="space-y-8">
      {/* Agent Header */}
      <div className="bg-card p-8 rounded-lg border border-border">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
            <Bot size={48} className="text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{agent.name}</h1>
            <p className="text-muted-foreground mb-4">{agent.description}</p>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Star className="text-yellow-500" size={20} />
                <span className="font-semibold">{agent.reputation_score}</span>
                <span className="text-muted-foreground">reputation</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase size={20} />
                <span className="font-semibold">{agent.completed_jobs}</span>
                <span className="text-muted-foreground">jobs completed</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={20} />
                <span className="text-muted-foreground">
                  Joined {new Date(agent.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Capabilities */}
      <div>
        <h2 className="text-xl font-bold mb-4">Capabilities</h2>
        <div className="flex gap-2">
          {agent.capabilities?.map((cap: string) => (
            <span key={cap} className="bg-secondary px-3 py-1 rounded-full text-sm">
              {cap}
            </span>
          ))}
        </div>
      </div>

      {/* Services */}
      <div>
        <h2 className="text-xl font-bold mb-4">Services</h2>
        <div className="grid grid-cols-2 gap-4">
          {agent.services?.map((service: any) => (
            <div key={service.id} className="bg-card p-6 rounded-lg border border-border">
              <h3 className="font-semibold text-lg mb-2">{service.name}</h3>
              <p className="text-muted-foreground mb-4">{service.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary">
                  ${service.price_usdc} USDC
                </span>
                <button
                  onClick={() => setShowCreateJob(true)}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded"
                >
                  Hire Agent
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reputation History */}
      <div>
        <h2 className="text-xl font-bold mb-4">Reputation History</h2>
        <div className="space-y-4">
          {agent.reputation?.map((event: any) => (
            <div key={event.id} className="bg-card p-4 rounded-lg border border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-500" size={20} />
                <div>
                  <span className="font-semibold">{event.tag}</span>
                  <span className="text-muted-foreground ml-2">
                    by {event.validator_address.slice(0, 6)}...{event.validator_address.slice(-4)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{event.score}</span>
                <span className="text-muted-foreground">/100</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Job Modal */}
      {showCreateJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-card p-8 rounded-lg border border-border max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Create Job</h2>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Describe your task requirements..."
              className="w-full p-4 bg-background border border-border rounded-lg mb-4 h-32"
            />
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowCreateJob(false)}
                className="px-4 py-2 border border-border rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => createJobMutation.mutate(agent.services[0]?.id)}
                disabled={!jobDescription || createJobMutation.isPending}
                className="bg-primary text-primary-foreground px-4 py-2 rounded disabled:opacity-50"
              >
                {createJobMutation.isPending ? "Creating..." : "Create Job"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
