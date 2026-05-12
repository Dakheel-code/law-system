// Permissions store — loads and persists the four chunks of configuration
// (role grants, custom roles, bundles, user grants) into a single singleton
// row in public.permission_settings. All four are JSONB columns so the
// whole page can load/save in a single round-trip.

import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export type CustomRole = {
  key: string;
  label: string;
  /**
   * Marks a built-in role as hidden. The original `defaultRoles` array stays
   * intact (users assigned that role still have a valid `type` value), but
   * the role is filtered out of the UI lists.
   */
  hidden?: boolean;
};
export type PermissionBundle = {
  key: string;
  label: string;
  description: string;
  permissions: string[];
};

export type PermissionSettings = {
  roleGrants: Record<string, string[]>;
  customRoles: CustomRole[];
  bundles: PermissionBundle[];
  userGrants: Record<string, string[]>;
};

const empty: PermissionSettings = {
  roleGrants: {},
  customRoles: [],
  bundles: [],
  userGrants: {},
};

type Row = {
  id: string;
  role_grants: Record<string, string[]> | null;
  custom_roles: CustomRole[] | null;
  bundles: PermissionBundle[] | null;
  user_grants: Record<string, string[]> | null;
};

function fromRow(row: Row): PermissionSettings {
  return {
    roleGrants: row.role_grants ?? {},
    customRoles: row.custom_roles ?? [],
    bundles: row.bundles ?? [],
    userGrants: row.user_grants ?? {},
  };
}

export function usePermissionSettings() {
  const [settings, setSettings] = useState<PermissionSettings>(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedTick, setSavedTick] = useState(0);

  const refresh = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("permission_settings")
      .select("*")
      .limit(1)
      .maybeSingle();
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    if (data) setSettings(fromRow(data as Row));
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    const sb = supabase;
    if (!sb) return;
    const ch = sb
      .channel(`perm-settings-${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "permission_settings" },
        (payload) => {
          if (payload.new) setSettings(fromRow(payload.new as Row));
        }
      )
      .subscribe();
    return () => {
      sb.removeChannel(ch);
    };
  }, []);

  /**
   * Persist a patch. Updates local state immediately for snappy UI, then
   * writes the merged result back to Supabase. Sets `savedTick` on success
   * so consumers can flash a "Saved" indicator.
   */
  const save = async (patch: Partial<PermissionSettings>) => {
    if (!supabase) return false;
    const next: PermissionSettings = { ...settings, ...patch };
    setSettings(next);
    setSaving(true);
    setError(null);
    const { error } = await supabase
      .from("permission_settings")
      .update({
        role_grants: next.roleGrants,
        custom_roles: next.customRoles,
        bundles: next.bundles,
        user_grants: next.userGrants,
        updated_at: new Date().toISOString(),
      })
      .not("id", "is", null);
    setSaving(false);
    if (error) {
      setError(error.message);
      return false;
    }
    setSavedTick((t) => t + 1);
    return true;
  };

  return { settings, loading, error, saving, savedTick, refresh, save };
}
