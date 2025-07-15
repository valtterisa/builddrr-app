"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";
import { signInWithOAuth, signUpWithOAuth } from "@/app/(auth)/actions";

export type OAuthProvider = "google" | "apple" | "github" | "facebook";
export type OAuthVariant = "default" | "dark" | "light";
export type OAuthAction = "sign-in" | "sign-up" | "continue";

interface OAuthButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onError"> {
  provider: OAuthProvider;
  variant?: OAuthVariant;
  action?: OAuthAction;
}

export function OAuthButton({
  provider,
  variant = "default",
  action = "sign-in",
  className,
}: OAuthButtonProps) {
  const getButtonText = () => {
    const actionText = {
      "sign-in": "Sign in with",
      "sign-up": "Sign up with",
      continue: "Continue with",
    };

    const providerName =
      provider === "github"
        ? "GitHub"
        : provider === "facebook"
          ? "Facebook"
          : provider.charAt(0).toUpperCase() + provider.slice(1);

    return `${actionText[action]} ${providerName}`;
  };

  const ProviderLogo = () => {
    switch (provider) {
      case "google":
        return (
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
              <path
                fill="#4285F4"
                d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
              />
              <path
                fill="#34A853"
                d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
              />
              <path
                fill="#FBBC05"
                d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
              />
              <path
                fill="#EA4335"
                d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
              />
            </g>
          </svg>
        );
      case "apple":
        return (
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16.7023 12.1364C16.7171 10.5226 17.6136 9.03409 19.0682 8.14773C18.0682 6.75 16.5909 5.92045 14.8295 5.83636C13.1705 5.67045 11.4318 6.78409 10.6136 6.78409C9.76136 6.78409 8.28409 5.86364 6.89773 5.86364C4.78409 5.89773 2.52273 7.46591 2.52273 10.6591C2.52273 11.7727 2.73864 12.9318 3.17045 14.1364C3.75 15.75 5.68182 19.1136 7.69318 19.0682C8.63636 19.0455 9.27273 18.3864 10.5 18.3864C11.6932 18.3864 12.2841 19.0682 13.3523 19.0682C15.3864 19.0455 17.1364 15.9545 17.6932 14.3409C15.2045 13.2273 16.7023 12.1364 16.7023 12.1364ZM13.7614 4.5C14.5909 3.52273 14.5 2.5 14.5 2C13.6364 2.04545 12.6364 2.54545 12.0227 3.18182C11.3409 3.86364 10.9773 4.75 11.0455 5.81818C11.9773 5.86364 12.9318 5.47727 13.7614 4.5Z"
              fill={variant === "dark" ? "white" : "black"}
            />
          </svg>
        );
      case "github":
        return (
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.477 2 2 6.477 2 12C2 16.418 4.865 20.166 8.84 21.49C9.34 21.58 9.52 21.27 9.52 21C9.52 20.77 9.51 20.14 9.51 19.31C6.73 19.91 6.14 17.97 6.14 17.97C5.68 16.81 5.03 16.5 5.03 16.5C4.12 15.88 5.1 15.9 5.1 15.9C6.1 15.97 6.63 16.93 6.63 16.93C7.5 18.45 8.97 18 9.54 17.76C9.63 17.11 9.89 16.67 10.17 16.42C7.95 16.17 5.62 15.31 5.62 11.5C5.62 10.39 6 9.5 6.65 8.79C6.55 8.54 6.2 7.5 6.75 6.15C6.75 6.15 7.59 5.88 9.5 7.17C10.29 6.95 11.15 6.84 12 6.84C12.85 6.84 13.71 6.95 14.5 7.17C16.41 5.88 17.25 6.15 17.25 6.15C17.8 7.5 17.45 8.54 17.35 8.79C18 9.5 18.38 10.39 18.38 11.5C18.38 15.32 16.04 16.16 13.81 16.41C14.17 16.72 14.5 17.33 14.5 18.26C14.5 19.6 14.49 20.68 14.49 21C14.49 21.27 14.67 21.59 15.17 21.49C19.14 20.16 22 16.42 22 12C22 6.477 17.523 2 12 2Z"
              fill={variant === "dark" ? "white" : "black"}
            />
          </svg>
        );
      case "facebook":
        return (
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.19795 21.5H13.198V13.4901H16.8021L17.198 9.50977H13.198V7.5C13.198 6.94772 13.6457 6.5 14.198 6.5H17.198V2.5H14.198C11.4365 2.5 9.19795 4.73858 9.19795 7.5V9.50977H7.19795L6.80206 13.4901H9.19795V21.5Z"
              fill="#1877F2"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <Button
      type="button"
      variant={
        (provider === "apple" && variant === "dark") ||
        (provider === "github" && variant === "dark") ||
        provider === "facebook"
          ? "default"
          : "outline"
      }
      className={cn(
        "flex items-center justify-center gap-2 h-10 w-full border-purple-100 hover:bg-purple-50 hover:border-purple-200 transition-colors",
        className
      )}
      onClick={() =>
        action === "sign-in"
          ? signInWithOAuth(provider)
          : signUpWithOAuth(provider)
      }
    >
      <ProviderLogo />
      <span>{getButtonText()}</span>
    </Button>
  );
}
