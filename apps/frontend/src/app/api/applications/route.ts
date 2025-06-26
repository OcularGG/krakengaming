import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// Application validation schema
const ApplicationSchema = z.object({
  captainName: z.string().min(2).max(100),
  preferredNickname: z.string().min(1).max(50).optional(),
  currentNation: z.enum(['Great Britain', 'USA', 'France', 'The Pirates', 'Russia', 'Sweden']),
  timeZone: z.string().min(1),
  hoursInNavalAction: z.string().transform(val => parseInt(val, 10)),
  steamConnected: z.boolean(),
  currentRank: z.string().min(1),
  previousCommands: z.string().optional(),
  preferredRole: z.enum(['Commander', 'Line of Battle', 'Screener']),
  isPortBattleCommander: z.boolean(),
  commanderExperience: z.string().optional(),
  isCrafter: z.boolean(),
  weeklyPlayTime: z.string().transform(val => parseInt(val, 10)),
  portBattleAvailability: z.array(z.string()),
  typicalSchedule: z.string().min(1),
  declarationAccuracy: z.boolean().refine(val => val === true, {
    message: "You must agree to the accuracy declaration"
  }),
  declarationHonor: z.boolean().refine(val => val === true, {
    message: "You must agree to the honor declaration"
  }),
  declarationRules: z.boolean().refine(val => val === true, {
    message: "You must agree to the rules declaration"
  }),
  signature: z.string().min(1),
});

const DISCORD_GUILD_ID = '1386130264895520868';
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const APPLICATION_CATEGORY_ID = '1387857769628962957';
const RECRUITER_ROLE_ID = '1387857527873474560';

// Helper function to sanitize Discord channel name
function sanitizeChannelName(displayName: string): string {
  return displayName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 45) // Discord channel name limit
    .replace(/^-|-$/g, '');
}

// Helper function to create Discord channel
async function createApplicationChannel(discordId: string, displayName: string, applicationId: string) {
  if (!DISCORD_BOT_TOKEN) {
    console.log('Discord bot token not configured, skipping channel creation');
    return null;
  }

  try {
    const sanitizedName = sanitizeChannelName(displayName || 'applicant');
    const channelName = `app-${sanitizedName}`;

    // Create the channel
    const channelResponse = await fetch(`https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/channels`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: channelName,
        type: 0, // Text channel
        parent_id: APPLICATION_CATEGORY_ID,
        permission_overwrites: [
          {
            id: DISCORD_GUILD_ID, // @everyone
            type: 0,
            deny: '1024', // VIEW_CHANNEL
          },
          {
            id: discordId, // Applicant
            type: 1,
            allow: '1024', // VIEW_CHANNEL
          },
          {
            id: RECRUITER_ROLE_ID, // Recruiter role
            type: 0,
            allow: '1024', // VIEW_CHANNEL
          },
        ],
      }),
    });

    if (!channelResponse.ok) {
      throw new Error(`Failed to create channel: ${channelResponse.status}`);
    }

    const channel = await channelResponse.json();

    // Send application embed
    const embedResponse = await fetch(`https://discord.com/api/v10/channels/${channel.id}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [{
          title: '⚓ New Application Received',
          color: 0x1e3a8a, // navy blue
          fields: [
            {
              name: 'Applicant',
              value: `<@${discordId}>`,
              inline: true,
            },
            {
              name: 'Display Name',
              value: displayName || 'Unknown',
              inline: true,
            },
            {
              name: 'Submitted',
              value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
              inline: false,
            },
            {
              name: 'Application Details',
              value: `[View Full Application](${process.env.NEXT_PUBLIC_DOMAIN}/admin/applications/${applicationId})`,
              inline: false,
            },
          ],
          footer: {
            text: `Application ID: ${applicationId}`,
          },
        }],
        components: [{
          type: 1,
          components: [{
            type: 2,
            style: 1, // Primary
            label: 'Start Interview',
            custom_id: `interview_${applicationId}`,
            emoji: { name: '🎤' },
          }],
        }],
      }),
    });

    if (!embedResponse.ok) {
      console.error('Failed to send application embed');
    }

    // Ping the recruiter role
    await fetch(`https://discord.com/api/v10/channels/${channel.id}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: `<@&${RECRUITER_ROLE_ID}> New application ready for review!`,
      }),
    });

    return channel.id;

  } catch (error) {
    console.error('Error creating Discord application channel:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.discordId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();

    // Validate the application data
    const validatedData = ApplicationSchema.parse(body);

    // Check for existing pending application
    const existingApplication = await prisma.application.findFirst({
      where: {
        discordId: session.user.discordId,
        status: 'PENDING',
      },
    });

    if (existingApplication) {
      return NextResponse.json({
        error: 'You already have a pending application',
        applicationId: existingApplication.id,
      }, { status: 409 });
    }

    // Check for cooldown period
    const cooldown = await prisma.applicationCooldown.findUnique({
      where: { discordId: session.user.discordId },
    });

    if (cooldown && cooldown.canReapplyAt && new Date() < cooldown.canReapplyAt) {
      return NextResponse.json({
        error: 'You are still in cooldown period',
        canReapplyAt: cooldown.canReapplyAt.toISOString(),
      }, { status: 429 });
    }

    // Find or create user record
    let user = await prisma.user.findUnique({
      where: { discordId: session.user.discordId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email || '',
          username: session.user.name || 'Unknown',
          discordId: session.user.discordId,
        },
      });
    }

    // Create application record in database
    const application = await prisma.application.create({
      data: {
        userId: user.id,
        discordId: session.user.discordId,
        discordUsername: session.user.name || 'Unknown',
        applicantName: validatedData.captainName,
        email: session.user.email,
        status: 'PENDING',

        // Application form data
        captainName: validatedData.captainName,
        preferredNickname: validatedData.preferredNickname || null,
        currentNation: validatedData.currentNation,
        timeZone: validatedData.timeZone,
        hoursInNavalAction: validatedData.hoursInNavalAction,
        steamConnected: validatedData.steamConnected,
        currentRank: validatedData.currentRank,
        previousCommands: validatedData.previousCommands || null,
        preferredRole: validatedData.preferredRole,
        isPortBattleCommander: validatedData.isPortBattleCommander,
        commanderExperience: validatedData.commanderExperience || null,
        isCrafter: validatedData.isCrafter,
        weeklyPlayTime: validatedData.weeklyPlayTime,
        portBattleAvailability: JSON.stringify(validatedData.portBattleAvailability),
        typicalSchedule: validatedData.typicalSchedule,
        declarationAccuracy: validatedData.declarationAccuracy,
        declarationHonor: validatedData.declarationHonor,
        declarationRules: validatedData.declarationRules,
        signature: validatedData.signature,
      },
    });

    // Create Discord application channel
    const channelId = await createApplicationChannel(
      session.user.discordId,
      session.user.name || validatedData.captainName,
      application.id
    );

    // Update application with Discord channel ID if created
    if (channelId) {
      await prisma.application.update({
        where: { id: application.id },
        data: { discordChannelId: channelId },
      });
    }

    console.log('Application submitted:', application.id);

    return NextResponse.json({
      success: true,
      applicationId: application.id,
      channelId: channelId,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors,
      }, { status: 400 });
    }

    console.error('Error submitting application:', error);
    return NextResponse.json({
      error: 'Failed to submit application',
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user has admin role (this would be checked against database roles)
    // For now, we'll assume any authenticated user can view applications

    const applications = await prisma.application.findMany({
      orderBy: { submittedAt: 'desc' },
      include: {
        vouches: {
          include: {
            reviewer: true,
          },
        },
      },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Applications fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}
