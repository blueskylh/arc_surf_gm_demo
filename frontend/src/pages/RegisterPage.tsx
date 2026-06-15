import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api, fetchApi } from "../lib/api";
import { Bot, Plus, X } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage({ navigate }: { navigate: (path: string) => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [capabilities, setCapabilities] = useState<string[]>([]);
  const [newCapability, setNewCapability] = useState("");

  const registerMutation = useMutation({
    mutationFn: async () => {
      const walletAddress = localStorage.getItem("walletAddress");
      const walletId = localStorage.getItem("walletId");
      if (!walletAddress || !walletId) {
        throw new Error("Please connect wallet first");
      }

      // 1. 上传元数据到IPFS (简化：使用示例URI)
      const metadataUri = "ipfs://bafkreibdi6623n3xpf7ymk62ckb4bo75o3qemwkpfvp5i25j66itxvsoei";

      // 2. 调用API注册
      return fetchApi("agents", {
        method: "POST",
        body: JSON.stringify({
          name,
          description,
          capabilities,
          metadata_uri: metadataUri,
          wallet_id: walletId,
          wallet_address: walletAddress,
          owner_address: walletAddress,
        }),
      });
    },
    onSuccess: (data) => {
      toast.success("Agent registered successfully!");
      navigate(`/agent/${data.agent.id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const addCapability = () => {
    if (newCapability && !capabilities.includes(newCapability)) {
      setCapabilities([...capabilities, newCapability]);
      setNewCapability("");
    }
  };

  const removeCapability = (cap: string) => {
    setCapabilities(capabilities.filter(c => c !== cap));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Register AI Agent</h1>

      <div className="space-y-6">
        {/* Agent Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
            <Bot size={48} className="text-primary" />
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Agent Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My AI Agent"
            className="w-full p-3 bg-card border border-border rounded-lg"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your agent's capabilities and purpose..."
            className="w-full p-3 bg-card border border-border rounded-lg h-32"
          />
        </div>

        {/* Capabilities */}
        <div>
          <label className="block text-sm font-medium mb-2">Capabilities</label>
          <div className="flex gap-2 mb-3 flex-wrap">
            {capabilities.map((cap) => (
              <span key={cap} className="bg-secondary px-3 py-1 rounded-full flex items-center gap-2">
                {cap}
                <button onClick={() => removeCapability(cap)}>
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCapability}
              onChange={(e) => setNewCapability(e.target.value)}
              placeholder="Add capability..."
              className="flex-1 p-3 bg-card border border-border rounded-lg"
              onKeyPress={(e) => e.key === "Enter" && addCapability()}
            />
            <button
              onClick={addCapability}
              className="bg-secondary p-3 rounded-lg"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Wallet Connection */}
        <div className="bg-card p-4 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">
            Wallet: {localStorage.getItem("walletAddress") || "Not connected"}
          </p>
        </div>

        {/* Submit */}
        <button
          onClick={() => registerMutation.mutate()}
          disabled={!name || !description || registerMutation.isPending}
          className="w-full bg-primary text-primary-foreground py-3 rounded-lg disabled:opacity-50"
        >
          {registerMutation.isPending ? "Registering..." : "Register Agent"}
        </button>
      </div>
    </div>
  );
}
