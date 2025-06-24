"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export type Team = {
  team_id: string;
  name: string;
  role: "owner" | "admin" | "billing" | "editor" | "viewer";
};

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
};

// Accept teamId as parameter
export function useTeams(teamId?: string) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserTeams = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const supabase = createClient();

        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error(userError?.message || "User not authenticated");
        }

        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, full_name, email, avatar_url")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          // Continue without profile data
        } else {
          setProfile(profileData);
        }

        // Get user's teams
        const { data: membershipsData, error: teamsError } = await supabase
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
          .eq("user_id", user.id)
          .eq("status", "active");

        if (teamsError) {
          throw new Error(teamsError.message);
        }

        // Format teams data
        const formattedTeams: Team[] = membershipsData
          .filter(item => item.team) // Filter out entries with null team
          .map(item => ({
            team_id: item.team_id,
            name: item.team.name,
            role: item.role,
          }));

        setTeams(formattedTeams);

        // Use teamId from URL if present, else localStorage, else first team
        let initialTeam: Team | null = null;
        if (teamId) {
          initialTeam = formattedTeams.find(team => team.team_id === teamId) || null;
        } else {
          const savedTeamId = localStorage.getItem('currentTeamId');
          initialTeam = savedTeamId
            ? formattedTeams.find(team => team.team_id === savedTeamId) || null
            : null;
        }
        setCurrentTeam(initialTeam || (formattedTeams.length > 0 ? formattedTeams[0] : null));
      } catch (err) {
        console.error('Failed to fetch teams:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch teams');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserTeams();
    // Only re-run if teamId changes
  }, [teamId]);

  // Remove localStorage update, switching team should be handled by router
  const switchTeam = (teamId: string) => {
    const team = teams.find(t => t.team_id === teamId);
    if (team) {
      setCurrentTeam(team);
    }
  };

  return { teams, currentTeam, switchTeam, profile, isLoading, error };
}
