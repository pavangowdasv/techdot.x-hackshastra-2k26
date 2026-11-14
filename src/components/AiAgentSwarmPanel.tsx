import { useState } from 'react';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Cpu,
  Droplets,
  Hammer,
  HardHat,
  Play,
  RotateCcw,
  Sparkles,
  Trash2,
  Users,
  Zap,
} from 'lucide-react';
import { DOMAIN_AGENTS, type DomainAgent } from '../types/auth';
import type { CivilTicket } from '../types/ticket';

interface AiAgentSwarmPanelProps {
  tickets: CivilTicket[];
  selectedAgentId: string | null;
  onSelectAgent: (agentId: string | null) => void;
  onBatchAutoDispatch: () => void;
  isDispatching?: boolean;
}

export function AiAgentSwarmPanel({
  tickets,
  selectedAgentId,
  onSelectAgent,
  onBatchAutoDispatch,
  isDispatching = false,
}: AiAgentSwarmPanelProps) {
  const [logOpen, setLogOpen] = useState(false);

  const getAgentTicketCount = (agent: DomainAgent) => {
    return tickets.filter(
      (t) =>
        t.department === agent.department ||
        agent.categories.includes(t.category) ||
        t.aiAgentAssigned === agent.name ||
        t.assignedCrew === agent.assignedWorker.crew,
    ).length;
  };

  const getAgentIcon = (id: string) => {
    switch (id) {
      case 'agent-pave':
        return <Hammer className="h-4 w-4 text-[#F59E0B]" />;
      case 'agent-hydro':
        return <Droplets className="h-4 w-4 text-[#06B6D4]" />;
      case 'agent-volt':
        return <Zap className="h-4 w-4 text-[#8B5CF6]" />;
      case 'agent-sweep':
        return <Trash2 className="h-4 w-4 text-[#10B981]" />;
      default:
        return <Bot className="h-4 w-4 text-[#06B6D4]" />;
    }
  };

  // Unassigned or new tickets waiting for agent triage
  const unassignedTickets = tickets.filter(
    (t) => t.status === 'new' || !t.assignedCrew || !t.assignedWorkerId,
  );

  return (
    <div className="glass-level-2 rounded-2xl border border-[#7657F6]/40 p-5 shadow-2xl relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-80 h-32 bg-gradient-to-l from-[#7657F6]/15 to-transparent pointer-events-none rounded-tr-2xl" />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#22304A] pb-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-[#06B6D4] mb-1">
            <Cpu className="h-4 w-4 text-[#7657F6]" />
            <span>Autonomous Multi-Agent Triage Engine</span>
            <span className="h-2 w-2 rounded-full bg-[#10B981] animate-ping" />
          </div>
          <h2 className="font-display text-lg font-bold text-[#F3F4F6] flex items-center gap-2">
            <span>AI Domain Agent Team (4 Specialized Swarm Agents)</span>
          </h2>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            Incoming complaints are automatically analyzed, divided into 4 main domain departments, and routed to the 4 dedicated field workers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedAgentId && (
            <button
              type="button"
              onClick={() => onSelectAgent(null)}
              className="h-9 px-3 rounded-xl border border-[#22304A] bg-[#0F172A] text-xs font-mono text-[#9CA3AF] hover:text-white"
            >
              Clear Filter
            </button>
          )}

          <button
            type="button"
            disabled={isDispatching}
            onClick={onBatchAutoDispatch}
            className={`h-9 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
              isDispatching
                ? 'bg-[#22304A] text-[#9CA3AF] cursor-wait'
                : 'bg-gradient-to-r from-[#7657F6] to-[#06B6D4] text-white hover:shadow-[0_0_18px_rgba(118,87,246,0.5)] active:scale-[0.98]'
            }`}
          >
            {isDispatching ? (
              <>
                <RotateCcw className="h-3.5 w-3.5 animate-spin" />
                <span>Agents Triaging &amp; Assigning...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 text-[#06B6D4]" />
                <span>Run AI Multi-Agent Batch Dispatch ({unassignedTickets.length} Pending)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4 Agent Cards Grid */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {DOMAIN_AGENTS.map((agent) => {
          const count = getAgentTicketCount(agent);
          const isSelected = selectedAgentId === agent.id;

          return (
            <div
              key={agent.id}
              onClick={() => onSelectAgent(isSelected ? null : agent.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-[#06B6D4] bg-[#06B6D4]/15 shadow-[0_0_16px_rgba(6,182,212,0.3)]'
                  : 'border-[#22304A] bg-[#0F172A]/85 hover:border-[#7657F6]/60 hover:bg-[#151D2E]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-7 w-7 rounded-lg flex items-center justify-center border"
                      style={{
                        backgroundColor: `${agent.accentColor}20`,
                        borderColor: `${agent.accentColor}50`,
                      }}
                    >
                      {getAgentIcon(agent.id)}
                    </div>
                    <div>
                      <div className="font-display text-xs font-bold text-[#F3F4F6] flex items-center gap-1.5">
                        <span>{agent.name}</span>
                      </div>
                      <span className="font-mono text-[9px] text-[#9CA3AF]">{agent.code}</span>
                    </div>
                  </div>
                  <span
                    className="font-mono text-xs font-bold px-2 py-0.5 rounded-full border"
                    style={{
                      color: agent.accentColor,
                      backgroundColor: `${agent.accentColor}15`,
                      borderColor: `${agent.accentColor}40`,
                    }}
                  >
                    {count} assigned
                  </span>
                </div>

                <div className="mt-2.5">
                  <div className="text-[11px] font-semibold text-[#F3F4F6] truncate">
                    {agent.domain.split('&')[0]}
                  </div>
                  <p className="mt-1 text-[10px] text-[#9CA3AF] line-clamp-2 leading-relaxed">
                    {agent.description}
                  </p>
                </div>
              </div>

              {/* Worker Mapping Footnote */}
              <div className="mt-3 pt-2.5 border-t border-[#22304A] flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <HardHat className="h-3 w-3 text-[#F59E0B] shrink-0" />
                  <span className="text-[#C9C4D8] font-medium truncate">
                    Worker: {agent.assignedWorker.name}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#06B6D4] shrink-0">
                  {agent.assignedWorker.crew}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

