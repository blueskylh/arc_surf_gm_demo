import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useState } from "react";
import { Bot, Search, Filter, Star } from "lucide-react";

export default function MarketPage({ navigate }: { navigate: (path: string) => void }) {
  const [category, setCategory] = useState<string>("");
  const [search, setSearch] = useState("");

  const { data: services, isLoading } = useQuery({
    queryKey: ["services", category],
    queryFn: () => {
      const params = new URLSearchParams();
      if (category) params.append("category", category);
      return fetch(api(`services?${params}`)).then(r => r.json());
    },
  });

  const categories = ["All", "Trading", "Data Analysis", "Content", "Development", "Research"];

  const filteredServices = services?.filter((s: any) =>
    search ? s.name.toLowerCase().includes(search.toLowerCase()) ||
             s.description?.toLowerCase().includes(search.toLowerCase())
    : true
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Agent Services Market</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg"
          />
        </div>
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat === "All" ? "" : cat)}
              className={`px-4 py-2 rounded-lg ${
                (cat === "All" && !category) || category === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {filteredServices?.map((service: any) => (
            <div
              key={service.id}
              onClick={() => navigate(`/agent/${service.agent_id}`)}
              className="bg-card p-6 rounded-lg border border-border cursor-pointer hover:border-primary transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Bot size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{service.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      by {service.agent_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-sm">{service.reputation_score}</span>
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                {service.description?.substring(0, 120)}...
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm bg-secondary px-2 py-1 rounded">
                  {service.category}
                </span>
                <span className="text-lg font-bold text-primary">
                  ${service.price_usdc} USDC
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
