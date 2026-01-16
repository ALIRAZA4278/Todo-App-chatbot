"use client";

/**
 * Protected layout for authenticated routes.
 * Per specs/features/authentication.md - US-AUTH-4 & US-AUTH-5
 */
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "@/lib/auth";
import { Spinner } from "@/components/ui";
import { UserMenu } from "@/components/todo/UserMenu";
import { ChatWidget } from "@/components/chat";
import Link from "next/link";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isPending) {
      if (!session?.user) {
        // Redirect to signin with callback URL
        const callbackUrl = encodeURIComponent(pathname);
        router.push(`/signin?callbackUrl=${callbackUrl}`);
      } else {
        setIsChecking(false);
      }
    }
  }, [session, isPending, router, pathname]);

  // Show loading while checking auth
  if (isPending || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, return null (redirect will happen)
  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/tasks"
              className="flex items-center gap-2 text-gray-800 hover:text-gray-600 transition-colors"
            >
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              <span className="font-semibold text-lg">Hackathon Todo</span>
            </Link>

            {/* User menu */}
            <UserMenu
              user={{
                name: session.user.name,
                email: session.user.email,
              }}
            />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>{children}</main>

      {/* AI Chat Widget */}
      <ChatWidget />
    </div>
  );
}
