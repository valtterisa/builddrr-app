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
// NOTE: You might need user context (e.g., from useAuth) to determine permissions (like Owner)

// Mock team data - TODO: Fetch actual team members from your backend API
const initialTeamMembers: TeamMember[] = [
  {
    id: "user_1",
    name: "Alice Wonderland",
    email: "alice@example.com",
    role: "Owner",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: "user_2",
    name: "Bob The Builder",
    email: "bob@example.com",
    role: "Admin",
    avatar: null,
  },
  {
    id: "user_3",
    name: "Charlie Chaplin",
    email: "charlie@example.com",
    role: "Member",
    avatar: "/placeholder-user.jpg",
  },
];

type TeamMemberRole = "Owner" | "Admin" | "Member";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamMemberRole;
  avatar: string | null;
}

export default function TeamPage() {
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamMemberRole>("Member");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState<string | null>(null); // Store member ID being updated
  const [isRemoving, setIsRemoving] = useState<string | null>(null); // Store member ID being removed

  // TODO: Fetch team members from backend API on mount
  useEffect(() => {
    const fetchTeam = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setTeamMembers(initialTeamMembers);
      setIsLoading(false);
    };
    fetchTeam();
  }, []);

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    // TODO: Add logic to send invitation via backend API.
    // This API should handle sending emails and potentially creating a user/invite record (e.g., in Supabase).
    console.log(`Inviting ${inviteEmail} as ${inviteRole}`);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // Add the new member optimistically (or after API success)
    const newMember: TeamMember = {
      id: `user_${Date.now()}`,
      name: "Invited User (Pending)", // Indicate pending state
      email: inviteEmail,
      role: inviteRole,
      avatar: null,
    };
    setTeamMembers([...teamMembers, newMember]);
    setIsInviting(false);
    setInviteEmail("");
    setInviteRole("Member");
    setIsInviteDialogOpen(false);
    toast({
      title: "Success",
      description: `Invitation sent to ${inviteEmail}.`,
    });
  };

  const handleRoleChange = async (
    memberId: string,
    newRole: TeamMemberRole
  ) => {
    setIsUpdatingRole(memberId);
    // TODO: Add logic to update role via backend API.
    // This API should update the member's role in your database (e.g., Supabase).
    console.log(`Changing role for ${memberId} to ${newRole}`);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setTeamMembers(
      teamMembers.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );
    setIsUpdatingRole(null);
    toast({ title: "Success", description: `Role updated for member.` });
  };

  const handleRemoveMember = async (memberId: string) => {
    setIsRemoving(memberId);
    // TODO: Add logic to remove member via backend API.
    // This API should remove the member from the team in your database (e.g., Supabase).
    console.log(`Removing member ${memberId}`);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setTeamMembers(teamMembers.filter((m) => m.id !== memberId));
    setIsRemoving(null);
    toast({ title: "Success", description: `Member removed from team.` });
  };

  return (
    <div className="container py-10 px-4 md:px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">
            Invite and manage team members for your workspace.
          </p>
        </div>
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
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
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Member">Member</SelectItem>
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
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              Manage who has access to this workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
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
                          {member.role === "Owner" ? (
                            <span className="text-sm font-medium">
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
                                <SelectItem value="Admin">Admin</SelectItem>
                                <SelectItem value="Member">Member</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {member.role !== "Owner" && (
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
                                  onClick={() => handleRemoveMember(member.id)}
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
      </div>
    </div>
  );
}
