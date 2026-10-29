import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabase";
import { ChildAgeBand, deriveAgeBand } from "./childData";

export type ChildAccount = {
  id: string;
  reunificationCaseId?: string;
  displayName: string;
  age: number;
  ageBand: ChildAgeBand;
  avatarIcon?: string;
  loginMethod: "pin" | "picture" | "letter";
  lastActiveAt?: string;
};

type ChildContextType = {
  childAccount: ChildAccount | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithPin: (childId: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  loginWithPicture: (childId: string, pictureSequence: string[]) => Promise<{ success: boolean; error?: string }>;
  loginWithLetter: (childId: string, word: string) => Promise<{ success: boolean; error?: string }>;
  logoutChild: () => void;
};

const ChildContext = createContext<ChildContextType | undefined>(undefined);

export const ChildProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [childAccount, setChildAccount] = useState<ChildAccount | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loginWithPin = async (childId: string, pin: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("child_accounts")
        .select("id, case_id, display_name, age, avatar_icon, login_method")
        .eq("id", childId)
        .eq("pin_code", pin)
        .single();

      if (error || !data) {
        return { success: false, error: "Incorrect PIN code. Please try again." };
      }

      const account: ChildAccount = {
        id: data.id,
        reunificationCaseId: data.case_id,
        displayName: data.display_name || "Child",
        age: data.age || 8,
        ageBand: deriveAgeBand(data.age || 8),
        avatarIcon: data.avatar_icon || "🌟",
        loginMethod: "pin",
        lastActiveAt: new Date().toISOString(),
      };

      setChildAccount(account);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to log in" };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithPicture = async (
    childId: string,
    pictureSequence: string[]
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const seqString = pictureSequence.join("-");
      const { data, error } = await supabase
        .from("child_accounts")
        .select("id, case_id, display_name, age, avatar_icon, login_method")
        .eq("id", childId)
        .eq("picture_passcode", seqString)
        .single();

      if (error || !data) {
        return { success: false, error: "Incorrect picture sequence. Please try again." };
      }

      const account: ChildAccount = {
        id: data.id,
        reunificationCaseId: data.case_id,
        displayName: data.display_name || "Child",
        age: data.age || 5,
        ageBand: deriveAgeBand(data.age || 5),
        avatarIcon: data.avatar_icon || "🎨",
        loginMethod: "picture",
        lastActiveAt: new Date().toISOString(),
      };

      setChildAccount(account);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to log in" };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithLetter = async (
    childId: string,
    word: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const cleanWord = word.trim().toLowerCase();
      const { data, error } = await supabase
        .from("child_accounts")
        .select("id, case_id, display_name, age, avatar_icon, login_method")
        .eq("id", childId)
        .eq("letter_passcode", cleanWord)
        .single();

      if (error || !data) {
        return { success: false, error: "Incorrect secret word. Please try again." };
      }

      const account: ChildAccount = {
        id: data.id,
        reunificationCaseId: data.case_id,
        displayName: data.display_name || "Child",
        age: data.age || 9,
        ageBand: deriveAgeBand(data.age || 9),
        avatarIcon: data.avatar_icon || "🚀",
        loginMethod: "letter",
        lastActiveAt: new Date().toISOString(),
      };

      setChildAccount(account);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to log in" };
    } finally {
      setIsLoading(false);
    }
  };

  const logoutChild = () => {
    setChildAccount(null);
  };

  return (
    <ChildContext.Provider
      value={{
        childAccount,
        isAuthenticated: !!childAccount,
        isLoading,
        loginWithPin,
        loginWithPicture,
        loginWithLetter,
        logoutChild,
      }}
    >
      {children}
    </ChildContext.Provider>
  );
};

export function useChildContext() {
  const context = useContext(ChildContext);
  if (!context) {
    throw new Error("useChildContext must be used within a ChildProvider");
  }
  return context;
}
