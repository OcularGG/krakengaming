import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // TODO: Check if user has admin role

    // Note: This will fail until Prisma client is properly updated
    // const cooldowns = await prisma.applicationCooldown.findMany({
    //   where: {
    //     canReapplyAt: {
    //       gt: new Date(),
    //     },
    //   },
    //   orderBy: { canReapplyAt: 'asc' },
    // });

    // Mock data for now
    const cooldowns: any[] = [];

    return NextResponse.json({ cooldowns });

  } catch (error) {
    console.error('Error fetching cooldowns:', error);
    return NextResponse.json({
      error: 'Failed to fetch cooldowns',
    }, { status: 500 });
  }
}
