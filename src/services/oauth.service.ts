import { OAuth2Client } from "google-auth-library";
import prisma from "../lib/prisma";
import { signToken } from "../lib/jwt";
import type { UserRole } from "../generated/prisma";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_PROVIDER = "google";

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

type GoogleIdentity = {
  providerAccountId: string;
  email: string;
  fullName: string;
};

type AuthUser = {
  id: number;
  email: string | null;
  username: string;
  role: UserRole;
  fullName: string;
};

/**
 * Verifies a Google-issued ID token and extracts the identity we trust.
 * Everything downstream assumes these three fields are already validated.
 */
async function verifyGoogleIdToken(idToken: string): Promise<GoogleIdentity> {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error("Google sign-in is not configured");
  }

  const ticket = await client.verifyIdToken({
    idToken,
    // Pinning the audience is what stops a token that Google minted for a
    // different application from being replayed against SAMS.
    audience: GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload?.sub) {
    throw new Error("Google token is missing a subject claim");
  }

  if (!payload.email) {
    throw new Error("Google account did not provide an email address");
  }

  // Without this check, anyone who can create a Google account for an address
  // they do not own could take over the matching SAMS account when we link by
  // email below.
  if (payload.email_verified !== true) {
    throw new Error("Google account email is not verified");
  }

  return {
    providerAccountId: payload.sub,
    email: payload.email.toLowerCase(),
    fullName: payload.name?.trim() || payload.email.split("@")[0],
  };
}

/** Google gives us no username, so derive a unique one from the email. */
function baseUsernameFrom(email: string) {
  const local = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "");
  const trimmed = local.slice(0, 16);

  return trimmed.length >= 3 ? trimmed : `user${trimmed}`.slice(0, 16);
}

async function allocateUsername(email: string) {
  const base = baseUsernameFrom(email);

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const candidate = attempt === 0 ? base : `${base}${attempt}`;
    const taken = await prisma.user.findUnique({
      where: { username: candidate },
      select: { id: true },
    });

    if (!taken) {
      return candidate;
    }
  }

  return `${base}${Date.now().toString().slice(-6)}`;
}

function toAuthResponse(user: AuthUser) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    fullName: user.fullName,
    // Same SAMS JWT the password login issues, so requireAuth and every
    // downstream route stay untouched.
    token: signToken({ userId: user.id, role: user.role }),
  };
}

export async function loginWithGoogle(idToken: string) {
  const identity = await verifyGoogleIdToken(idToken);

  // 1. This Google account is already linked to a SAMS user.
  const linked = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: GOOGLE_PROVIDER,
        providerAccountId: identity.providerAccountId,
      },
    },
    include: { user: true },
  });

  if (linked) {
    if (!linked.user.isActive) {
      throw new Error("This account has been deactivated");
    }

    return toAuthResponse(linked.user);
  }

  // 2. A SAMS user already owns this verified email — link Google to it so the
  //    user keeps one account instead of silently getting a duplicate.
  const existing = await prisma.user.findUnique({
    where: { email: identity.email },
  });

  if (existing) {
    if (!existing.isActive) {
      throw new Error("This account has been deactivated");
    }

    await prisma.account.create({
      data: {
        userId: existing.id,
        provider: GOOGLE_PROVIDER,
        providerAccountId: identity.providerAccountId,
      },
    });

    return toAuthResponse(existing);
  }

  // 3. Brand new user. Always the lowest-privilege role: a provider claim must
  //    never decide a role. Admins promote doctors and admins explicitly.
  const username = await allocateUsername(identity.email);

  const created = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: identity.email,
        username,
        fullName: identity.fullName,
        password: null,
        role: "patient",
      },
    });

    await tx.account.create({
      data: {
        userId: user.id,
        provider: GOOGLE_PROVIDER,
        providerAccountId: identity.providerAccountId,
      },
    });

    return user;
  });

  return toAuthResponse(created);
}
