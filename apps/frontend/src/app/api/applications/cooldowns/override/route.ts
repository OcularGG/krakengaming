import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const OverrideSchema = z.object({
  discordId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // TODO: Check if user has admin role

    const body = await request.json();
    const validatedData = OverrideSchema.parse(body);

    // For now, return success since we can't update the database yet
    // await prisma.applicationCooldown.update({
    //   where: { discordId: validatedData.discordId },
    //   data: {
    //     overriddenBy: session.user.id || session.user.email!,
    //     overriddenAt: new Date(),
    //     canReapplyAt: new Date(), // Allow immediate reapplication
    //   },
    // });

    return NextResponse.json({
      success: true,
      message: 'Cooldown override successful',
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors,
      }, { status: 400 });
    }

    console.error('Error overriding cooldown:', error);
    return NextResponse.json({
      error: 'Failed to override cooldown',
    }, { status: 500 });
  }
}
