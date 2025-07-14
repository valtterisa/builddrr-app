"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { polar } from "@/lib/polar";

import { createClient } from "@/lib/supabase/server";
import { Provider } from "@supabase/supabase-js";

export async function login(formData: FormData) {
  const supabase = await createClient();

  // Create a schema for validation
  const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
  });

  try {
    // Extract and validate form data
    const formValues = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const validatedData = loginSchema.parse(formValues);

    // Attempt to sign in
    const { error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        throw new Error("Invalid email or password");
      }
      throw new Error(error.message);
    }

    revalidatePath("/", "layout");
    redirect("/dashboard");
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Get the first validation error
      const firstError = error.errors[0];
      throw new Error(firstError.message);
    }
    throw error; // Re-throw the error to be caught by the client
  }
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  // Create a schema for validation
  const signupSchema = z
    .object({
      firstName: z.string().min(1, "First name is required"),
      lastName: z.string().min(1, "Last name is required"),
      email: z.string().email("Invalid email address"),
      password: z.string().min(8, "Password must be at least 8 characters"),
      confirmPassword: z.string().min(1, "Please confirm your password"),
      terms: z
        .any()
        .refine(
          (val) => val === "on",
          "You must accept the terms and conditions"
        ),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

  try {
    // Extract and validate form data
    const formValues = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
      terms: formData.get("terms") as string,
    };

    const validatedData = signupSchema.parse(formValues);

    // Create the user in Supabase Auth
    const { data, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          first_name: validatedData.firstName,
          last_name: validatedData.lastName,
          full_name: `${validatedData.firstName} ${validatedData.lastName}`,
        },
      },
    });

    if (authError) {
      console.error("Failed to create user in Supabase", authError);
      // Handle specific error cases
      if (authError.message.includes("User already registered")) {
        redirect("/login?error=already-registered");
      }
      redirect("/error");
    }

    try {
      // Create user in Polar.sh
      const result = await polar.customers.create({
        externalId: data.user?.id,
        email: validatedData.email,
        name: `${validatedData.firstName} ${validatedData.lastName}`,
        billingAddress: { country: "US" },
      });

      // Assing user to Free plan
      
    } catch (error) {
      console.error("Failed to create user in Polar.sh", error);
    }

    revalidatePath("/", "layout");
    redirect("/dashboard");
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Get the first validation error
      const firstError = error.errors[0];
      redirect(`/signup?error=${encodeURIComponent(firstError.message)}`);
    }
    redirect("/error");
  }
}

export async function logout() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signInWithOAuth(provider: Provider) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_URL}/api/auth/callback`,
    },
  });

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  data.url ? redirect(data.url) : redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}
