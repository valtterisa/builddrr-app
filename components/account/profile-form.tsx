"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AccountSection } from "@/components/account/account-section";

type Me = {
  id: string;
  name: string;
  email: string;
  customInstructions: string;
};

export function ProfileForm() {
  const me = useQuery((api as any).users.me, {}) as Me | null | undefined;
  const updateProfile = useMutation((api as any).users.updateProfile);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (me) setName(me.name);
  }, [me]);

  const onSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ name });
      toast.success("Profile saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AccountSection
      title="Profile"
      description="Your display name appears in the product. Email is tied to your sign-in."
    >
      {me === undefined ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="flex max-w-md flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="account-name">Name</Label>
            <Input
              id="account-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={80}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="account-email">Email</Label>
            <Input
              id="account-email"
              value={me?.email ?? ""}
              disabled
              readOnly
            />
          </div>
          <div>
            <Button
              onClick={() => void onSave()}
              disabled={saving || !name.trim() || name === me?.name}
              className="bg-brand text-brand-foreground hover:bg-brand/90"
            >
              {saving ? "Saving…" : "Save profile"}
            </Button>
          </div>
        </div>
      )}
    </AccountSection>
  );
}
