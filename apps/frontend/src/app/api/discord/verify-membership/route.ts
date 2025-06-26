import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const DISCORD_GUILD_ID = '1386130264895520868';
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.discordId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { discordId } = await request.json();

    // Verify the discordId matches the session
    if (discordId !== session.user.discordId) {
      return NextResponse.json({ error: 'Invalid discord ID' }, { status: 400 });
    }

    // Check if user is a member of our Discord server
    if (!DISCORD_BOT_TOKEN) {
      // In development or if bot token is not configured, assume membership
      return NextResponse.json({ isMember: true });
    }

    const discordResponse = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${discordId}`,
      {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        },
      }
    );

    const isMember = discordResponse.status === 200;

    return NextResponse.json({ isMember });

  } catch (error) {
    console.error('Error verifying Discord membership:', error);
    return NextResponse.json({ error: 'Failed to verify membership' }, { status: 500 });
  }
}
