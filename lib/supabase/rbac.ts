// import { createServerClient } from "@supabase/ssr";
// import { cookies } from "next/headers";

// // Define allowed roles
// export type AppRole = "admin" | "moderator" | "user";

// // Supabase client for server-side operations
// async function getSupabaseClient() {
//   return createServerClient<Database>(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         get(name: string) {
//           return await cookies().get(name)?.value;
//         },
//         set(name: string, value: string, options: any) {
//           cookies().set(name, value, options);
//         },
//         remove(name: string, options: any) {
//           cookies().set(name, "", { ...options, maxAge: 0 });
//         },
//       },
//     }
//   );
// }

// // 1. Get current user's role
// export async function getUserRole(): Promise<AppRole | null> {
//   const supabase = await getSupabaseClient();
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user) return null;

//   const { data, error } = await supabase
//     .from("user_roles")
//     .select("role")
//     .eq("user_id", user.id)
//     .single();

//   if (error || !data) return null;
//   return data.role as AppRole;
// }

// // 2. Set or update a user's role (admin-only)
// export async function setUserRole(
//   userId: string,
//   role: AppRole
// ): Promise<{ success: boolean; error?: string }> {
//   const supabase = await getSupabaseClient();
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user) {
//     return { success: false, error: "Unauthorized: No user logged in" };
//   }

//   // Check if current user is admin
//   const { data: currentUserRole, error: roleError } = await supabase
//     .from("user_roles")
//     .select("role")
//     .eq("user_id", user.id)
//     .single();

//   if (roleError || currentUserRole?.role !== "admin") {
//     return { success: false, error: "Unauthorized: Only admins can set roles" };
//   }

//   // Validate role
//   if (!["admin", "moderator", "user"].includes(role)) {
//     return { success: false, error: "Invalid role" };
//   }

//   // Set or update role
//   const { error } = await supabase
//     .from("user_roles")
//     .upsert({ user_id: userId, role }, { onConflict: "user_id" });

//   if (error) {
//     return { success: false, error: error.message };
//   }

//   return { success: true };
// }

// // 3. Check if user has one of the required roles
// export async function hasRequiredRole(
//   requiredRoles: AppRole[]
// ): Promise<boolean> {
//   const userRole = await getUserRole();
//   return userRole !== null && requiredRoles.includes(userRole);
// }

// // 4. Restrict access to routes or components
// export async function restrictAccess(requiredRoles: AppRole[]): Promise<{
//   isAuthorized: boolean;
//   redirect?: { destination: string };
// }> {
//   const isAuthorized = await hasRequiredRole(requiredRoles);

//   if (!isAuthorized) {
//     return {
//       isAuthorized: false,
//       redirect: { destination: "/unauthorized" },
//     };
//   }

//   return { isAuthorized: true };
// }

// // 5. Get all users with their roles (admin-only)
// export async function getAllUsersWithRoles(): Promise<
//   { user_id: string; email: string | undefined; role: AppRole }[] | null
// > {
//   const supabase = await getSupabaseClient();
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user) return null;

//   // Check if current user is admin
//   const { data: currentUserRole, error: roleError } = await supabase
//     .from("user_roles")
//     .select("role")
//     .eq("user_id", user.id)
//     .single();

//   if (roleError || currentUserRole?.role !== "admin") return null;

//   // Fetch users and their roles
//   const { data, error } = await supabase
//     .from("user_roles")
//     .select("user_id, role, users:auth.users(email)")
//     .order("user_id");

//   if (error) return null;

//   return data.map((item) => ({
//     user_id: item.user_id,
//     email: item.users?.email,
//     role: item.role as AppRole,
//   }));
// }
