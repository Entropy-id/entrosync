import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { prisma } from "#/utils/prisma";
import { LoginUserSchema, RegisterUserSchema } from "./auth.schema";
import { auth } from "./auth.utils";

export const registerServerFn = createServerFn()
  .validator(RegisterUserSchema)
  .handler(async ({ data }) => {
    await auth.api.signUpEmail({
      body: {
        name: data.name,
        email: data.email,
        password: data.password,
      },
    });
    throw redirect({
      to: "/onboarding",
    });
  });

export const loginServerFn = createServerFn()
  .validator(LoginUserSchema)
  .handler(async ({ data }) => {
    await auth.api.signInEmail({
      body: {
        email: data.email,
        password: data.password,
      },
    });
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    if (!session) {
      throw redirect({
        to: "/login",
      });
    }
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { onboardingCompleted: true },
    });
    if (!user?.onboardingCompleted) {
      throw redirect({
        to: "/onboarding",
      });
    }
    throw redirect({
      to: "/dashboard/admin",
    });
  });

export const loginWithGoogleServerFn = createServerFn().handler(async () => {
  const response = await auth.api.signInSocial({
    body: {
      provider: "google",
      callbackURL: "/dashboard/admin",
    },
  });

  throw redirect({
    href: response.url,
  });
});

export const registerWithGoogleServerFn = createServerFn().handler(async () => {
  const response = await auth.api.signInSocial({
    body: {
      provider: "google",
      callbackURL: "/onboarding",
    },
  });

  throw redirect({
    href: response.url,
  });
});

export const logoutServerFn = createServerFn().handler(async () => {
  const headers = getRequestHeaders();
  await auth.api.signOut({ headers });

  throw redirect({
    to: "/login",
  });
});

export const getSessionServerFn = createServerFn().handler(async () => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });

  return session;
});

export const getSessionWithOnboardingServerFn = createServerFn({
  method: "GET",
}).handler(async () => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompleted: true },
  });

  return {
    session,
    onboardingCompleted: user?.onboardingCompleted ?? false,
  };
});

export const completeOnboardingServerFn = createServerFn({
  method: "POST",
}).handler(async () => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session) throw new Error("Unauthorized");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { onboardingCompleted: true },
  });

  return { success: true };
});
