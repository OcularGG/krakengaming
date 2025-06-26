import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// Vouch validation schema
const VouchSchema = z.object({
  applicationId: z.string(),
  vouchType: z.enum(['positive', 'negative']),
  comments: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // TODO: Check if user has admin/recruiter role

    const body = await request.json();
    const validatedData = VouchSchema.parse(body);

    // Check if application exists
    const application = await prisma.application.findUnique({
      where: { id: validatedData.applicationId },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Check if user already vouched for this application
    const existingVouch = await prisma.applicationVouch.findUnique({
      where: {
        applicationId_reviewerId: {
          applicationId: validatedData.applicationId,
          reviewerId: session.user.id || session.user.email!,
        },
      },
    });

    if (existingVouch) {
      return NextResponse.json({ error: 'You have already vouched for this application' }, { status: 409 });
    }

    // Create the vouch
    const vouch = await prisma.applicationVouch.create({
      data: {
        applicationId: validatedData.applicationId,
        reviewerId: session.user.id || 'anonymous',
        isPositive: validatedData.vouchType === 'positive',
        comment: validatedData.comments || null,
      },
    });

    return NextResponse.json({
      success: true,
      vouch,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors,
      }, { status: 400 });
    }

    console.error('Error creating vouch:', error);
    return NextResponse.json({
      error: 'Failed to create vouch',
    }, { status: 500 });
  }
}
