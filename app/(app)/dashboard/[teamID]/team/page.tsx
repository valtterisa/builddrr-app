"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, UserPlus, Trash2, Loader2, Crown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { useParams, useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTeams } from "@/hooks/use-teams";

type TeamMemberRole = "owner" | "admin" | "billing" | "editor" | "viewer";

interface TeamMember {
  id: string | null;
  name: string | null;
  email: string;
  role: TeamMemberRole;
  avatar: string | null;
  memberSince: string | null;
  status: string; // 'active' | 'invited'
}

interface UserTeam {
  team_id: string;
  name: string;
  role: TeamMemberRole;
}

export default function TeamPage() {
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const teamId =
    typeof params.teamID === "string"
      ? params.teamID
      : Array.isArray(params.teamID)
      ? params.teamID[0]
      : undefined;
  const { currentTeam } = useTeams(teamId);
  const [userId, setUserId] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [userTeams, setUserTeams] = useState<UserTeam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamMemberRole>("editor");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [isTransferringOwnership, setIsTransferringOwnership] = useState<string | null>(null);
  const [showOwnershipAlert, setShowOwnershipAlert] = useState(false);
  const [pendingOwnershipTransfer, setPendingOwnershipTransfer] = useState<{memberId: string, name: string | null} | null>(null);
  const [showRemoveTeamAlert, setShowRemoveTeamAlert] = useState(false);
  const [isRemovingTeam, setIsRemovingTeam] = useState(false);
  const [showLeaveTeamAlert, setShowLeaveTeamAlert] = useState(false);
  const [isLeavingTeam, setIsLeavingTeam] = useState(false);

  // Helper function to check if the current user can manage team members
  const canManageTeam = () => {
    return currentTeam?.role === "owner" || currentTeam?.role === "admin" || currentTeam?.role === "editor";
  };

  // Helper function to get available roles based on current user's role
  const getAvailableRoles = (): TeamMemberRole[] => {
    switch (currentTeam?.role) {
      case "owner":
        return ["admin", "billing", "editor", "viewer"];
      case "admin":
        return ["editor", "viewer", "billing"];
      case "editor":
        return ["viewer"];
      default:
        return [];
    }
  };

  // Helper function to check if current user can modify a specific role
  const canModifyRole = (role: TeamMemberRole): boolean => {
    const availableRoles = getAvailableRoles();
    return availableRoles.includes(role);
  };

  // Helper function to check if a role is manageable by the current user
  const isRoleManageable = (role: TeamMemberRole): boolean => {
    // Role hierarchy from highest to lowest
    const roleHierarchy: TeamMemberRole[] = ["owner", "admin", "billing", "editor", "viewer"];

    if (!currentTeam?.role) return false;

    // Get the index of the current user's role in the hierarchy
    const currentUserRoleIndex = roleHierarchy.indexOf(currentTeam.role);

    // Get the index of the member's role in the hierarchy
    const memberRoleIndex = roleHierarchy.indexOf(role);

    // Current user can only manage roles that are lower in the hierarchy
    return memberRoleIndex > currentUserRoleIndex;
  };

  // Fetch current user on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          console.error("Error fetching user:", error);
          return;
        }

        setUserId(user.id);
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch user's teams when userId is available
  useEffect(() => {
    const fetchUserTeams = async () => {
      if (!userId) return;

      setIsLoadingTeams(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("memberships")
          .select(`
            user_id,
            team_id,
            role,
            status,
            team:team_id (
              id,
              name
            )
          `)
          .eq("user_id", userId)
          .eq("status", "active");

        if (error) throw error;

        // Format the data
        const formattedTeams: UserTeam[] = data
          .filter((item) => item.team) // Filter out entries with null team
          .map((item) => ({
            team_id: item.team_id,
            name: item.team.name,
            role: item.role as TeamMemberRole,
          }));

        setUserTeams(formattedTeams);

        // If teamId is not in user's teams, redirect to /dashboard/teams
        if (teamId && !formattedTeams.some((t) => t.team_id === teamId)) {
          router.replace("/dashboard/teams");
        }
      } catch (error) {
        console.error("Failed to fetch user teams:", error);
        toast({
          title: "Error",
          description: "Failed to load your teams. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingTeams(false);
        setIsLoading(false);
      }
    };

    fetchUserTeams();
  }, [userId, toast, teamId, router]);

  // Fetch team members and pending invitations when teamId changes
  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!teamId) return;
      setIsLoadingMembers(true);
      try {
        const supabase = createClient();
        // Fetch active members
        const { data: membersData, error: membersError } = await supabase
          .from("memberships")
          .select(`
            user_id,
            role,
            status,
            joined_at,
            profile:profiles!user_id (
              id,
              full_name,
              email,
              avatar_url
            )
          `)
          .eq("team_id", teamId)
          .in("status", ["active"]);
        if (membersError) throw membersError;
        // Fetch pending invitations
        const { data: invitesData, error: invitesError } = await supabase
          .from("pending_invitations")
          .select(`
            id,
            email,
            role,
            invited_at,
            status
          `)
          .eq("team_id", teamId)
          .in("status", ["pending"]);
        if (invitesError) throw invitesError;
        // Format active members
        const formattedMembers: TeamMember[] = (membersData || [])
          .filter((item) => item.profile)
          .map((item) => ({
            id: item.user_id,
            name: item.profile.full_name || null,
            email: item.profile.email || "No Email",
            role: item.role as TeamMemberRole,
            avatar: item.profile.avatar_url || null,
            memberSince: item.joined_at || null,
            status: "active",
          }));
        // Format pending invites
        const formattedInvites: TeamMember[] = (invitesData || []).map((item) => ({
          id: null,
          name: null,
          email: item.email,
          role: item.role as TeamMemberRole,
          avatar: null,
          memberSince: item.invited_at || null,
          status: "invited",
        }));
        setTeamMembers([...formattedMembers, ...formattedInvites]);
      } catch (error) {
        console.error("Failed to fetch team members:", error);
        toast({
          title: "Error",
          description: "Failed to load team members. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingMembers(false);
      }
    };
    fetchTeamMembers();
  }, [teamId, toast]);

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user has permission to invite members
    if (!canManageTeam()) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to invite team members.",
        variant: "destructive",
      });
      return;
    }

    if (!teamId) {
      toast({
        title: "Error",
        description: "Please select a team first.",
        variant: "destructive",
      });
      return;
    }

    // Check if user can assign the selected role
    if (!canModifyRole(inviteRole)) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to assign this role.",
        variant: "destructive",
      });
      return;
    }

    // Check if the email already exists in the team members or pending invitations
    const emailExists = teamMembers.some(member =>
      member.email.toLowerCase() === inviteEmail.toLowerCase()
    );

    if (emailExists) {
      toast({
        title: "Error",
        description: "This user is already a member of this team or has a pending invitation.",
        variant: "destructive",
      });
      return;
    }

    setIsInviting(true);
    try {
      const supabase = createClient();

      // Create a pending invitation
      const { error } = await supabase
        .from("pending_invitations")
        .insert({
          email: inviteEmail,
          team_id: teamId,
          role: inviteRole,
          invited_by: userId,
          status: "pending",
        });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      toast({
        title: "Success",
        description: `Invitation sent to ${inviteEmail}.`,
      });

      // Don't call the local fetchTeamMembers function - call the one that refreshes both active members and pending invitations
      // This was defined in useEffect
      if (!teamId) return;
      setIsLoadingMembers(true);
      try {
        const supabase = createClient();
        // Fetch active members
        const { data: membersData, error: membersError } = await supabase
          .from("memberships")
          .select(`
            user_id,
            role,
            status,
            joined_at,
            profile:profiles!user_id (
              id,
              full_name,
              email,
              avatar_url
            )
          `)
          .eq("team_id", teamId)
          .in("status", ["active"]);
        if (membersError) throw membersError;

        // Fetch pending invitations
        const { data: invitesData, error: invitesError } = await supabase
          .from("pending_invitations")
          .select(`
            id,
            email,
            role,
            invited_at,
            status
          `)
          .eq("team_id", teamId)
          .in("status", ["pending"]);
        if (invitesError) throw invitesError;

        // Format active members
        const formattedMembers: TeamMember[] = (membersData || [])
          .filter((item) => item.profile)
          .map((item) => ({
            id: item.user_id,
            name: item.profile.full_name || null,
            email: item.profile.email || "No Email",
            role: item.role as TeamMemberRole,
            avatar: item.profile.avatar_url || null,
            memberSince: item.joined_at || null,
            status: "active",
          }));

        // Format pending invites
        const formattedInvites: TeamMember[] = (invitesData || []).map((item) => ({
          id: null,
          name: null,
          email: item.email,
          role: item.role as TeamMemberRole,
          avatar: null,
          memberSince: item.invited_at || null,
          status: "invited",
        }));

        setTeamMembers([...formattedMembers, ...formattedInvites]);
      } catch (error) {
        console.error("Failed to refresh team members after invitation:", error);
      } finally {
        setIsLoadingMembers(false);
      }
    } catch (error) {
      console.error("Failed to invite member:", error);
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
      setInviteEmail("");
      setInviteRole("editor");
      setIsInviteDialogOpen(false);
    }
  };

  const fetchTeamMembers = async () => {
    if (!teamId) return;

    setIsLoadingMembers(true);
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("memberships")
        .select(`
          user_id,
          role,
          status,
          created_at,
          profile:profiles!user_id (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq("team_id", teamId)
        .eq("status", "active");

      if (error) throw error;

      const formattedMembers: TeamMember[] = data
        .filter((item) => item.profile)
        .map((item) => ({
          id: item.user_id,
          name: item.profile.full_name || "No Name",
          email: item.profile.email || "No Email",
          role: item.role as TeamMemberRole,
          avatar: item.profile.avatar_url || null,
          memberSince: item.created_at || null,
        }));

      setTeamMembers(formattedMembers);
    } catch (error) {
      console.error("Failed to refresh team members:", error);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleRoleChange = async (
    memberId: string | null,
    newRole: TeamMemberRole,
    email?: string
  ) => {
    if (!teamId) return;

    // Special case for user changing their own role
    if (memberId === userId) {
      // Only allow changing to viewer or billing from editor
      if (currentTeam?.role === "editor" && (newRole === "viewer" || newRole === "billing")) {
        setIsUpdatingRole(memberId);
        try {
          const supabase = createClient();
          const { error } = await supabase
            .from("memberships")
            .update({ role: newRole })
            .eq("team_id", teamId)
            .eq("user_id", memberId);

          if (error) throw error;

          setTeamMembers(
            teamMembers.map((m) =>
              m.id === memberId ? { ...m, role: newRole } : m
            )
          );

          toast({
            title: "Success",
            description: `You have changed your role to ${newRole}.`,
          });
        } catch (error) {
          console.error("Failed to update your role:", error);
          toast({
            title: "Error",
            description: "Failed to update your role. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsUpdatingRole(null);
        }
        return;
      }
    }

    // Regular role change (for other users)
    // Check if user has permission to change roles
    if (!canManageTeam()) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to change team member roles.",
        variant: "destructive",
      });
      return;
    }

    // Check if user can assign the new role
    if (!canModifyRole(newRole)) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to assign this role.",
        variant: "destructive",
      });
      return;
    }

    // Use email as identifier for invited members, otherwise use memberId
    const identifier = memberId || email;
    setIsUpdatingRole(identifier);

    try {
      const supabase = createClient();
      if (memberId) {
        // Active member: update memberships
        const { error } = await supabase
          .from("memberships")
          .update({ role: newRole })
          .eq("team_id", teamId)
          .eq("user_id", memberId);
        if (error) throw error;
        setTeamMembers(
          teamMembers.map((m) =>
            m.id === memberId ? { ...m, role: newRole } : m
          )
        );
      } else if (email) {
        // Invited member: update pending_invitations
        const { error } = await supabase
          .from("pending_invitations")
          .update({ role: newRole })
          .eq("team_id", teamId)
          .eq("email", email);
        if (error) throw error;
        setTeamMembers(
          teamMembers.map((m) =>
            m.email === email && m.status === "invited"
              ? { ...m, role: newRole }
              : m
          )
        );
      }
      toast({
        title: "Success",
        description: `Role updated for member.`,
      });
    } catch (error) {
      console.error("Failed to update role:", error);
      toast({
        title: "Error",
        description: "Failed to update role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingRole(null);
    }
  };

  const handleRemoveMember = async (memberId: string | null, email?: string) => {
    if (!teamId) return;

    // Check if user has permission to remove members
    if (!canManageTeam()) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to remove team members.",
        variant: "destructive",
      });
      return;
    }

    // Use email as identifier for invited members, otherwise use memberId
    const identifier = memberId || email;
    setIsRemoving(identifier);

    try {
      const supabase = createClient();
      if (memberId) {
        // Active member: update memberships
        const { error } = await supabase
          .from("memberships")
          .update({ status: "removed" })
          .eq("team_id", teamId)
          .eq("user_id", memberId);
        if (error) throw error;
        setTeamMembers(teamMembers.filter((m) => m.id !== memberId));
      } else if (email) {
        // Invited member: update pending_invitations
        const { error } = await supabase
          .from("pending_invitations")
          .update({ status: "expired" })
          .eq("team_id", teamId)
          .eq("email", email);
        if (error) throw error;
        setTeamMembers(teamMembers.filter((m) => m.email !== email));
      }
      toast({
        title: "Success",
        description: `Member removed from team.`,
      });
    } catch (error) {
      console.error("Failed to remove member:", error);
      toast({
        title: "Error",
        description: "Failed to remove member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(null);
    }
  };

  const handleTransferOwnership = async (memberId: string) => {
    if (!teamId || !userId) return;

    // Only owner can transfer ownership
    if (currentTeam?.role !== "owner") {
      toast({
        title: "Permission Denied",
        description: "Only the team owner can transfer ownership.",
        variant: "destructive",
      });
      return;
    }

    setIsTransferringOwnership(memberId);

    try {
      const supabase = createClient();

      // Start a transaction to update both members
      // 1. Demote current owner to admin
      const { error: currentOwnerError } = await supabase
        .from("memberships")
        .update({ role: "admin" })
        .eq("team_id", teamId)
        .eq("user_id", userId)
        .eq("role", "owner");

      if (currentOwnerError) throw currentOwnerError;

      // 2. Promote selected member to owner
      const { error: newOwnerError } = await supabase
        .from("memberships")
        .update({ role: "owner" })
        .eq("team_id", teamId)
        .eq("user_id", memberId);

      if (newOwnerError) throw newOwnerError;

      // Update local state
      setTeamMembers(
        teamMembers.map((m) => {
          if (m.id === userId) return { ...m, role: "admin" };
          if (m.id === memberId) return { ...m, role: "owner" };
          return m;
        })
      );

      toast({
        title: "Success",
        description: "Team ownership transferred successfully.",
      });
    } catch (error) {
      console.error("Failed to transfer ownership:", error);
      toast({
        title: "Error",
        description: "Failed to transfer ownership. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTransferringOwnership(null);
      setPendingOwnershipTransfer(null);
    }
  };

  const initiateOwnershipTransfer = (memberId: string, name: string | null) => {
    // Only owner can transfer ownership
    if (currentTeam?.role !== "owner") {
      toast({
        title: "Permission Denied",
        description: "Only the team owner can transfer ownership.",
        variant: "destructive",
      });
      return;
    }

    setPendingOwnershipTransfer({ memberId, name });
    setShowOwnershipAlert(true);
  };

  const handleRemoveTeam = async () => {
    if (!teamId) return;

    // Only owner can remove the team
    if (currentTeam?.role !== "owner") {
      toast({
        title: "Permission Denied",
        description: "Only the team owner can remove the team.",
        variant: "destructive",
      });
      return;
    }

    setIsRemovingTeam(true);
    try {
      const supabase = createClient();

      // 1. Update all members' status to 'removed'
      const { error: membersError } = await supabase
        .from("memberships")
        .update({ status: "removed" })
        .eq("team_id", teamId);

      if (membersError) throw membersError;

      // 2. Delete the team
      const { error: teamError } = await supabase
        .from("teams")
        .delete()
        .eq("id", teamId);

      if (teamError) throw teamError;

      toast({
        title: "Success",
        description: "Team removed successfully.",
      });

      // Redirect to teams page
      router.replace("/dashboard/teams");
    } catch (error) {
      console.error("Failed to remove team:", error);
      toast({
        title: "Error",
        description: "Failed to remove team. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRemovingTeam(false);
      setShowRemoveTeamAlert(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (!teamId || !userId) return;

    setIsLeavingTeam(true);
    try {
      const supabase = createClient();

      // Update the member's status to 'removed'
      const { error } = await supabase
        .from("memberships")
        .update({ status: "removed" })
        .eq("team_id", teamId)
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "You have left the team.",
      });

      // Redirect to teams page
      router.replace("/dashboard/teams");
    } catch (error) {
      console.error("Failed to leave team:", error);
      toast({
        title: "Error",
        description: "Failed to leave team. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLeavingTeam(false);
      setShowLeaveTeamAlert(false);
    }
  };

  const handleSelfRoleChange = async (newRole: TeamMemberRole) => {
    if (!teamId || !userId) return;

    // Self-demotion is only allowed to lower roles
    const roleHierarchy: TeamMemberRole[] = ["owner", "admin", "billing", "editor", "viewer"];

    if (!currentTeam) {
      toast({
        title: "Error",
        description: "Could not determine your current role.",
        variant: "destructive",
      });
      return;
    }

    const currentRoleIndex = roleHierarchy.indexOf(currentTeam.role);
    const newRoleIndex = roleHierarchy.indexOf(newRole);

    // Check if the new role is lower than current role (higher index = lower role)
    if (newRoleIndex <= currentRoleIndex) {
      toast({
        title: "Error",
        description: "You can only change your role to a lower privilege level.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingRole(userId);

    try {
      const supabase = createClient();

      // Update the user's role
      const { error } = await supabase
        .from("memberships")
        .update({ role: newRole })
        .eq("team_id", teamId)
        .eq("user_id", userId);

      if (error) throw error;

      // Update local state
      setTeamMembers(
        teamMembers.map((m) =>
          m.id === userId ? { ...m, role: newRole } : m
        )
      );

      toast({
        title: "Success",
        description: `Your role has been changed to ${newRole}.`,
      });
    } catch (error) {
      console.error("Failed to update your role:", error);
      toast({
        title: "Error",
        description: "Failed to update your role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingRole(null);
    }
  };

  return (
    <div className="px-2 md:px-6 py-8 w-full">
      <SiteHeader title="Team Management" />
      <div className="space-y-6 pt-6">
        <div className="flex justify-between items-center">
          <div>
            {teamId && canManageTeam() && (
              <Dialog
                open={isInviteDialogOpen}
                onOpenChange={setIsInviteDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="bg-primary text-white font-semibold shadow-md hover:bg-primary/90 transition-colors">
                    <UserPlus className="mr-2 h-4 w-4" /> Invite Member
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Invite New Team Member</DialogTitle>
                    <DialogDescription>
                      Enter the email address and select a role for the new team member.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleInviteMember}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className="col-span-3"
                          required
                          placeholder="member@example.com"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">
                          Role
                        </Label>
                        <Select
                          value={inviteRole}
                          onValueChange={(value: TeamMemberRole) => setInviteRole(value)}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableRoles().map((role) => (
                              <SelectItem key={role} value={role}>
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={isInviting} className="bg-primary text-white font-semibold">
                        {isInviting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Send Invitation
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="flex space-x-2">
            {teamId && currentTeam?.role === "owner" && (
              <Button
                variant="destructive"
                onClick={() => setShowRemoveTeamAlert(true)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Remove Team
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Ownership Transfer Alert Dialog */}
      <AlertDialog open={showOwnershipAlert} onOpenChange={setShowOwnershipAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              Transfer Team Ownership
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to transfer ownership to <strong>{pendingOwnershipTransfer?.name || 'this user'}</strong>?
              <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-md text-orange-700">
                <strong>Warning:</strong> You will lose owner privileges and become an admin. This action cannot be undone.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingOwnershipTransfer && handleTransferOwnership(pendingOwnershipTransfer.memberId)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isTransferringOwnership ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Transfer Ownership
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Team Confirmation Dialog */}
      <AlertDialog open={showRemoveTeamAlert} onOpenChange={setShowRemoveTeamAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              Remove Team
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this team? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowRemoveTeamAlert(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveTeam}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isRemovingTeam ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Remove Team
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Leave Team Confirmation Dialog */}
      <AlertDialog open={showLeaveTeamAlert} onOpenChange={setShowLeaveTeamAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              Leave Team
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave this team? You can rejoin anytime from the teams page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowLeaveTeamAlert(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeaveTeam}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLeavingTeam ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Leave Team
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-6 mt-8">
        {teamId && (
          <Card className="shadow-lg border border-border rounded-xl">
            <CardHeader className="bg-muted/50 rounded-t-xl border-b border-border pb-4">
              <CardTitle className="text-lg font-bold">Team Members</CardTitle>
              <CardDescription>
                Manage who has access to this team.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingMembers ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="min-w-full divide-y divide-border">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Member</TableHead>
                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</TableHead>
                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</TableHead>
                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Member Since</TableHead>
                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</TableHead>
                        <TableHead className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamMembers.length > 0 ? (
                        teamMembers.map((member) => (
                          <TableRow key={member.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-medium px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  {member.avatar ? (
                                    <AvatarImage src={member.avatar} alt={member.name || member.email} />
                                  ) : (
                                    <AvatarFallback>
                                      {member.name ? member.name.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <span>{member.name || <span className="italic text-muted-foreground">Invited</span>}</span>
                              </div>
                            </TableCell>
                            <TableCell className="px-6 py-4">{member.email}</TableCell>
                            <TableCell className="px-6 py-4">
                              {/* Role selector - special case for self-demotion */}
                              {member.id === userId && member.status === "active" && currentTeam?.role === "editor" ? (
                                <Select
                                  value={member.role}
                                  onValueChange={(value: TeamMemberRole) =>
                                    handleRoleChange(
                                      member.id,
                                      value
                                    )
                                  }
                                  disabled={isUpdatingRole === member.id}
                                >
                                  <SelectTrigger className="w-[110px] h-8 text-xs">
                                    {isUpdatingRole === member.id && (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    )}
                                    <SelectValue placeholder="Select role" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="editor">Editor</SelectItem>
                                    <SelectItem value="billing">Billing</SelectItem>
                                    <SelectItem value="viewer">Viewer</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                // Original role display/selector for other cases
                                member.role === "owner" || !canManageTeam() || !canModifyRole(member.role) ? (
                                  <span className="text-sm font-medium capitalize">
                                    {member.role}
                                  </span>
                                ) : (
                                  <Select
                                    value={member.role}
                                    onValueChange={(value: TeamMemberRole) =>
                                      handleRoleChange(
                                        member.id,
                                        value,
                                        member.status === "invited" ? member.email : undefined
                                      )
                                    }
                                    disabled={isUpdatingRole === (member.id || member.email)}
                                  >
                                    <SelectTrigger className="w-[110px] h-8 text-xs">
                                      {isUpdatingRole === (member.id || member.email) && (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      )}
                                      <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {getAvailableRoles()
                                        .filter(role => role === member.role || canModifyRole(role))
                                        .map((role) => (
                                          <SelectItem key={role} value={role}>
                                            {role.charAt(0).toUpperCase() + role.slice(1)}
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                )
                              )}
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              {member.status === "active"
                                ? (member.memberSince ? new Date(member.memberSince).toLocaleDateString() : "-")
                                : <span className="italic text-muted-foreground">Pending</span>}
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              {member.status === "active" ? (
                                <span className="text-green-600 font-medium">Active</span>
                              ) : (
                                <span className="text-yellow-600 font-medium">Invited</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right px-6 py-4">
                              {/* For other team members (managed by higher roles) */}
                              {member.role !== "owner" && canManageTeam() && isRoleManageable(member.role) && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      className="h-8 w-8 p-0"
                                      disabled={isUpdatingRole === (member.id || member.email) || isRemoving === (member.id || member.email)}
                                    >
                                      <span className="sr-only">Open menu</span>
                                      {isRemoving === (member.id || member.email) ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <MoreHorizontal className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => handleRemoveMember(
                                        member.id,
                                        member.status === "invited" ? member.email : undefined
                                      )}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Remove Member
                                    </DropdownMenuItem>

                                    {/* Add Transfer Ownership option for active members (not for invited/pending) */}
                                    {currentTeam?.role === "owner" && member.status === "active" && member.id !== userId && (
                                      <DropdownMenuItem
                                        onClick={() => initiateOwnershipTransfer(member.id!, member.name)}
                                        className="text-orange-600"
                                      >
                                        <Crown className="mr-2 h-4 w-4" />
                                        Make Owner
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}

                              {/* For the current user to change their own role */}
                              {member.id === userId && member.status === "active" &&
                                member.role !== "owner" && member.role !== "viewer" && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      className="h-8 w-8 p-0"
                                      disabled={isUpdatingRole === member.id}
                                    >
                                      <span className="sr-only">Open menu</span>
                                      {isUpdatingRole === member.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <MoreHorizontal className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => setShowLeaveTeamAlert(true)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Leave Team
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                            No team members found. Invite your first member!
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
