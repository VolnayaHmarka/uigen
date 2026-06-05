import { describe, test, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuth } from "@/hooks/use-auth";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/actions", () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock("@/lib/anon-work-tracker", () => ({
  getAnonWorkData: vi.fn(),
  clearAnonWork: vi.fn(),
}));

vi.mock("@/actions/get-projects", () => ({
  getProjects: vi.fn(),
}));

vi.mock("@/actions/create-project", () => ({
  createProject: vi.fn(),
}));

import { signIn as signInAction, signUp as signUpAction } from "@/actions";
import { getAnonWorkData, clearAnonWork } from "@/lib/anon-work-tracker";
import { getProjects } from "@/actions/get-projects";
import { createProject } from "@/actions/create-project";

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // isLoading state

  test("starts with isLoading false", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isLoading).toBe(false);
  });

  test("sets isLoading true during signIn and false after", async () => {
    let resolveSignIn!: (val: unknown) => void;
    (signInAction as ReturnType<typeof vi.fn>).mockReturnValue(
      new Promise((resolve) => {
        resolveSignIn = resolve;
      })
    );

    const { result } = renderHook(() => useAuth());

    let signInPromise!: Promise<unknown>;
    act(() => {
      signInPromise = result.current.signIn("user@test.com", "password");
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolveSignIn({ success: false });
      await signInPromise;
    });

    expect(result.current.isLoading).toBe(false);
  });

  test("sets isLoading true during signUp and false after", async () => {
    let resolveSignUp!: (val: unknown) => void;
    (signUpAction as ReturnType<typeof vi.fn>).mockReturnValue(
      new Promise((resolve) => {
        resolveSignUp = resolve;
      })
    );

    const { result } = renderHook(() => useAuth());

    let signUpPromise!: Promise<unknown>;
    act(() => {
      signUpPromise = result.current.signUp("user@test.com", "password");
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolveSignUp({ success: false });
      await signUpPromise;
    });

    expect(result.current.isLoading).toBe(false);
  });

  // signIn

  test("signIn: calls action with credentials and returns result", async () => {
    (signInAction as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: false,
      error: "Invalid credentials",
    });

    const { result } = renderHook(() => useAuth());

    let returnValue: unknown;
    await act(async () => {
      returnValue = await result.current.signIn("user@test.com", "wrong");
    });

    expect(signInAction).toHaveBeenCalledWith("user@test.com", "wrong");
    expect(returnValue).toEqual({ success: false, error: "Invalid credentials" });
  });

  test("signIn failure: does not trigger post-sign-in navigation", async () => {
    (signInAction as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: false,
      error: "Invalid credentials",
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("user@test.com", "wrong");
    });

    expect(mockPush).not.toHaveBeenCalled();
    expect(getProjects).not.toHaveBeenCalled();
    expect(createProject).not.toHaveBeenCalled();
  });

  test("signIn success: runs handlePostSignIn", async () => {
    (signInAction as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
    (getAnonWorkData as ReturnType<typeof vi.fn>).mockReturnValue(null);
    (getProjects as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: "project-1" },
    ]);

    const { result } = renderHook(() => useAuth());

    let returnValue: unknown;
    await act(async () => {
      returnValue = await result.current.signIn("user@test.com", "password");
    });

    expect(returnValue).toEqual({ success: true });
    expect(mockPush).toHaveBeenCalledWith("/project-1");
  });

  test("signIn: resets isLoading even when action throws", async () => {
    (signInAction as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Network error")
    );

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("user@test.com", "password").catch(() => {});
    });

    expect(result.current.isLoading).toBe(false);
  });

  // signUp

  test("signUp: calls action with credentials and returns result", async () => {
    (signUpAction as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: false,
      error: "Email already registered",
    });

    const { result } = renderHook(() => useAuth());

    let returnValue: unknown;
    await act(async () => {
      returnValue = await result.current.signUp("existing@test.com", "password123");
    });

    expect(signUpAction).toHaveBeenCalledWith("existing@test.com", "password123");
    expect(returnValue).toEqual({ success: false, error: "Email already registered" });
  });

  test("signUp failure: does not trigger post-sign-in navigation", async () => {
    (signUpAction as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: false,
      error: "Email already registered",
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signUp("existing@test.com", "password123");
    });

    expect(mockPush).not.toHaveBeenCalled();
    expect(getProjects).not.toHaveBeenCalled();
    expect(createProject).not.toHaveBeenCalled();
  });

  test("signUp success: runs handlePostSignIn", async () => {
    (signUpAction as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
    (getAnonWorkData as ReturnType<typeof vi.fn>).mockReturnValue(null);
    (getProjects as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: "project-1" },
    ]);

    const { result } = renderHook(() => useAuth());

    let returnValue: unknown;
    await act(async () => {
      returnValue = await result.current.signUp("new@test.com", "password123");
    });

    expect(returnValue).toEqual({ success: true });
    expect(mockPush).toHaveBeenCalledWith("/project-1");
  });

  test("signUp: resets isLoading even when action throws", async () => {
    (signUpAction as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Server error")
    );

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signUp("user@test.com", "password").catch(() => {});
    });

    expect(result.current.isLoading).toBe(false);
  });

  // handlePostSignIn — anon work with messages

  test("anon work with messages: creates project from anon data, clears it, redirects", async () => {
    const anonWork = {
      messages: [{ role: "user", content: "make a button" }],
      fileSystemData: { "/App.jsx": { content: "export default () => <button/>" } },
    };
    (signInAction as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
    (getAnonWorkData as ReturnType<typeof vi.fn>).mockReturnValue(anonWork);
    (createProject as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "anon-project",
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("user@test.com", "password");
    });

    expect(createProject).toHaveBeenCalledWith({
      name: expect.stringMatching(/^Design from /),
      messages: anonWork.messages,
      data: anonWork.fileSystemData,
    });
    expect(clearAnonWork).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/anon-project");
    expect(getProjects).not.toHaveBeenCalled();
  });

  test("anon work with empty messages array: falls through to getProjects", async () => {
    (signInAction as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
    (getAnonWorkData as ReturnType<typeof vi.fn>).mockReturnValue({
      messages: [],
      fileSystemData: {},
    });
    (getProjects as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: "existing-project" },
    ]);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("user@test.com", "password");
    });

    expect(createProject).not.toHaveBeenCalled();
    expect(clearAnonWork).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/existing-project");
  });

  test("null anon work: falls through to getProjects", async () => {
    (signInAction as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
    (getAnonWorkData as ReturnType<typeof vi.fn>).mockReturnValue(null);
    (getProjects as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: "existing-project" },
    ]);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("user@test.com", "password");
    });

    expect(mockPush).toHaveBeenCalledWith("/existing-project");
    expect(createProject).not.toHaveBeenCalled();
  });

  // handlePostSignIn — no anon work, existing projects

  test("no anon work, multiple projects: redirects to the most recent (first) project", async () => {
    (signInAction as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
    (getAnonWorkData as ReturnType<typeof vi.fn>).mockReturnValue(null);
    (getProjects as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: "recent-project" },
      { id: "older-project" },
    ]);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("user@test.com", "password");
    });

    expect(mockPush).toHaveBeenCalledWith("/recent-project");
    expect(createProject).not.toHaveBeenCalled();
  });

  // handlePostSignIn — no anon work, no projects

  test("no anon work, no projects: creates a new project and redirects", async () => {
    (signInAction as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
    (getAnonWorkData as ReturnType<typeof vi.fn>).mockReturnValue(null);
    (getProjects as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (createProject as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "brand-new-project",
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("user@test.com", "password");
    });

    expect(createProject).toHaveBeenCalledWith({
      name: expect.stringMatching(/^New Design #\d+$/),
      messages: [],
      data: {},
    });
    expect(mockPush).toHaveBeenCalledWith("/brand-new-project");
  });

  test("new project name uses a random number in range 0–99999", async () => {
    (signInAction as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
    (getAnonWorkData as ReturnType<typeof vi.fn>).mockReturnValue(null);
    (getProjects as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (createProject as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "p" });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("user@test.com", "password");
    });

    const name: string = (createProject as ReturnType<typeof vi.fn>).mock.calls[0][0]
      .name as string;
    const num = parseInt(name.replace("New Design #", ""), 10);
    expect(num).toBeGreaterThanOrEqual(0);
    expect(num).toBeLessThan(100000);
  });
});
