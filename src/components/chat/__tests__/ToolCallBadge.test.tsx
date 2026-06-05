import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge, getToolCallLabel } from "../ToolCallBadge";

afterEach(() => {
  cleanup();
});

// --- getToolCallLabel unit tests ---

test("getToolCallLabel: str_replace_editor create", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "create", path: "/App.jsx" }))
    .toBe("Creating /App.jsx");
});

test("getToolCallLabel: str_replace_editor str_replace", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "str_replace", path: "/components/Card.jsx" }))
    .toBe("Editing /components/Card.jsx");
});

test("getToolCallLabel: str_replace_editor insert", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "insert", path: "/App.jsx" }))
    .toBe("Editing /App.jsx");
});

test("getToolCallLabel: str_replace_editor view", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "view", path: "/App.jsx" }))
    .toBe("Reading /App.jsx");
});

test("getToolCallLabel: str_replace_editor undo_edit", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "undo_edit", path: "/App.jsx" }))
    .toBe("Undoing edit in /App.jsx");
});

test("getToolCallLabel: str_replace_editor unknown command with path", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "unknown", path: "/App.jsx" }))
    .toBe("Editing /App.jsx");
});

test("getToolCallLabel: str_replace_editor no command no path", () => {
  expect(getToolCallLabel("str_replace_editor", {}))
    .toBe("Editing file");
});

test("getToolCallLabel: file_manager rename", () => {
  expect(getToolCallLabel("file_manager", { command: "rename", path: "/old.jsx", new_path: "/new.jsx" }))
    .toBe("Renaming /old.jsx → /new.jsx");
});

test("getToolCallLabel: file_manager delete", () => {
  expect(getToolCallLabel("file_manager", { command: "delete", path: "/App.jsx" }))
    .toBe("Deleting /App.jsx");
});

test("getToolCallLabel: file_manager unknown command", () => {
  expect(getToolCallLabel("file_manager", { command: "unknown" }))
    .toBe("Managing file");
});

test("getToolCallLabel: unknown tool name returns tool name", () => {
  expect(getToolCallLabel("some_other_tool", {}))
    .toBe("some_other_tool");
});

// --- ToolCallBadge component tests ---

test("ToolCallBadge renders create label", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Creating /App.jsx")).toBeDefined();
});

test("ToolCallBadge renders edit label for str_replace", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "str_replace", path: "/components/Button.jsx" }}
      state="result"
    />
  );
  expect(screen.getByText("Editing /components/Button.jsx")).toBeDefined();
});

test("ToolCallBadge renders rename label", () => {
  render(
    <ToolCallBadge
      toolName="file_manager"
      args={{ command: "rename", path: "/old.jsx", new_path: "/new.jsx" }}
      state="result"
    />
  );
  expect(screen.getByText("Renaming /old.jsx → /new.jsx")).toBeDefined();
});

test("ToolCallBadge renders delete label", () => {
  render(
    <ToolCallBadge
      toolName="file_manager"
      args={{ command: "delete", path: "/unused.jsx" }}
      state="result"
    />
  );
  expect(screen.getByText("Deleting /unused.jsx")).toBeDefined();
});

test("ToolCallBadge shows spinner when state is call", () => {
  const { container } = render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="call"
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("ToolCallBadge shows spinner when state is partial-call", () => {
  const { container } = render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="partial-call"
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("ToolCallBadge shows green dot when state is result", () => {
  const { container } = render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="result"
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});
