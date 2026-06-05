"use client";

import { Loader2 } from "lucide-react";

interface ToolCallBadgeProps {
  toolName: string;
  args: Record<string, any>;
  state: "call" | "partial-call" | "result";
}

export function getToolCallLabel(toolName: string, args: Record<string, any>): string {
  if (toolName === "str_replace_editor") {
    const { command, path } = args;
    const target = path ?? "file";
    switch (command) {
      case "create":      return `Creating ${target}`;
      case "str_replace": return `Editing ${target}`;
      case "insert":      return `Editing ${target}`;
      case "view":        return `Reading ${target}`;
      case "undo_edit":   return `Undoing edit in ${target}`;
      default:            return path ? `Editing ${target}` : "Editing file";
    }
  }
  if (toolName === "file_manager") {
    const { command, path, new_path } = args;
    switch (command) {
      case "rename": return `Renaming ${path} → ${new_path}`;
      case "delete": return `Deleting ${path}`;
      default:       return "Managing file";
    }
  }
  return toolName;
}

export function ToolCallBadge({ toolName, args, state }: ToolCallBadgeProps) {
  const isDone = state === "result";
  const label = getToolCallLabel(toolName, args);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" aria-hidden="true" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600 flex-shrink-0" aria-hidden="true" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
