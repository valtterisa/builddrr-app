"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { MoreHorizontal, UserPlus, Trash2, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import {
  getWebsiteUsers,
  addWebsiteUser,
  updateWebsiteUserRole,
  removeWebsiteUser,
} from "@/lib/database";
import { SiteHeader } from "@/components/site-header";

type TeamMemberRole = "owner" | "admin" | "editor" | "viewer";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamMemberRole;
  avatar: string | null;
}

interface UserWebsite {
  website_id: string;
  name: string;
  role: TeamMemberRole;
}

export default function TeamPage() {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [userWebsites, setUserWebsites] = useState<UserWebsite[]>([]);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamMemberRole>("editor");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

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

  // Fetch user's websites when userId is available
  useEffect(() => {
    const fetchUserWebsites = async () => {
      if (!userId) return;

      setIsLoading(true);
      try {
        // Create a client-side Supabase client
        const supabase = createClient();

        // Get user websites directly from the client
        const { data, error } = await supabase
          .from("website_users")
          .select(
            `
            *,
            website:website_id (*)
          `
          )
          .eq("user_id", userId);

        if (error) throw error;

        // Format the data as before
        const formattedWebsites: UserWebsite[] = data
          .filter((item) => item.website) // Filter out entries with null website
          .map((item) => ({
            website_id: item.website_id,
            name: item.website.name,
            role: item.role,
          }));

        if (data.some((item) => !item.website)) {
          console.warn("Some website entries are null:", data);
        }

        setUserWebsites(formattedWebsites);

        // Select the first website by default if available
        if (formattedWebsites.length > 0 && !selectedWebsiteId) {
          setSelectedWebsiteId(formattedWebsites[0].website_id);
        }
      } catch (error) {
        console.error("Failed to fetch user websites:", error);
        toast({
          title: "Error",
          description: "Failed to load your websites. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserWebsites();
  }, [userId, toast, selectedWebsiteId]);

  // Fetch team members when selected website changes
  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!selectedWebsiteId) return;

      setIsLoadingMembers(true);
      try {
        const supabase = createClient();

        // Fetch team members
        const { data: teamData, error: teamError } = await supabase
          .from("website_users")
          .select("user_id, role")
          .eq("website_id", selectedWebsiteId);

        if (teamError) throw teamError;

        // Fetch profiles for each team member
        const profilePromises = teamData.map((item) =>
          supabase
            .from("profiles")
            .select("id, full_name, email, avatar_url")
            .eq("id", item.user_id)
            .single()
        );

        const profileResults = await Promise.all(profilePromises);

        const formattedMembers: TeamMember[] = teamData.map((item, index) => {
          const profile = profileResults[index].data;
          return {
            id: item.user_id,
            name: profile?.full_name || "No Name",
            email: profile?.email || "No Email",
            role: item.role,
            avatar: profile?.avatar_url || null,
          };
        });

        setTeamMembers(formattedMembers);
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
  }, [selectedWebsiteId, toast]);

  const handleWebsiteChange = (websiteId: string) => {
    setSelectedWebsiteId(websiteId);
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWebsiteId) {
      toast({
        title: "Error",
        description: "Please select a website first.",
        variant: "destructive",
      });
      return;
    }

    setIsInviting(true);
    try {
      const dummyUserId = "tempUserId"; // This would be fetched based on email in a real implementation
      await addWebsiteUser(selectedWebsiteId, dummyUserId, inviteRole);

      toast({
        title: "Success",
        description: `Invitation sent to ${inviteEmail}.`,
      });

      // Refresh the team members list
      const updatedUsers = await getWebsiteUsers(selectedWebsiteId);
      const formattedMembers = updatedUsers.map((item) => ({
        id: item.user_id,
        name: item.profile.full_name || "No Name",
        email: item.profile.email || "No Email",
        role: item.role,
        avatar: item.profile.avatar_url,
      }));

      setTeamMembers(formattedMembers);
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

  const handleRoleChange = async (
    memberId: string,
    newRole: TeamMemberRole
  ) => {
    if (!selectedWebsiteId) return;

    setIsUpdatingRole(memberId);
    try {
      await updateWebsiteUserRole(selectedWebsiteId, memberId, newRole);

      // Update local state
      setTeamMembers(
        teamMembers.map((m) =>
          m.id === memberId ? { ...m, role: newRole } : m
        )
      );

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

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedWebsiteId) return;

    setIsRemoving(memberId);
    try {
      await removeWebsiteUser(selectedWebsiteId, memberId);

      // Update local state
      setTeamMembers(teamMembers.filter((m) => m.id !== memberId));

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

  return (
    <div className="px-4 md:px-6">
      <SiteHeader title="Team Management" />
      <div className="space-y-6 pt-4">
        {selectedWebsiteId && (
          <Dialog
            open={isInviteDialogOpen}
            onOpenChange={setIsInviteDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" /> Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Invite New Team Member</DialogTitle>
                <DialogDescription>
                  Enter the email address and select a role for the new team
                  member.
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
                      onValueChange={(value: TeamMemberRole) =>
                        setInviteRole(value)
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isInviting}>
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

      {/* Website Selector */}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Website</CardTitle>
            <CardDescription>
              Choose a website to manage team members for.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading your websites...</span>
              </div>
            ) : userWebsites.length > 0 ? (
              <Select
                value={selectedWebsiteId || ""}
                onValueChange={handleWebsiteChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a website" />
                </SelectTrigger>
                <SelectContent>
                  {userWebsites.map((site) => (
                    <SelectItem key={site.website_id} value={site.website_id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p>You don't have access to any websites. Create one first.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {selectedWebsiteId && (
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage who has access to this website.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingMembers ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers.length > 0 ? (
                      teamMembers.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={member.avatar ?? undefined}
                                  alt={member.name}
                                />
                                <AvatarFallback>
                                  {member.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span>{member.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{member.email}</TableCell>
                          <TableCell>
                            {member.role === "owner" ? (
                              <span className="text-sm font-medium capitalize">
                                {member.role}
                              </span>
                            ) : (
                              <Select
                                value={member.role}
                                onValueChange={(value: TeamMemberRole) =>
                                  handleRoleChange(member.id, value)
                                }
                                disabled={
                                  isUpdatingRole === member.id ||
                                  isRemoving === member.id
                                }
                              >
                                <SelectTrigger className="w-[110px] h-8 text-xs">
                                  {isUpdatingRole === member.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <SelectValue placeholder="Select role" />
                                  )}
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="editor">Editor</SelectItem>
                                  <SelectItem value="viewer">Viewer</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {member.role !== "owner" && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    disabled={
                                      isUpdatingRole === member.id ||
                                      isRemoving === member.id
                                    }
                                  >
                                    <span className="sr-only">Open menu</span>
                                    {isRemoving === member.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <MoreHorizontal className="h-4 w-4" />
                                    )}
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleRemoveMember(member.id)
                                    }
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Remove Member
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center h-24">
                          No team members found. Invite your first member!
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
