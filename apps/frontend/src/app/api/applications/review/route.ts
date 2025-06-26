import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// Review validation schema
const ReviewSchema = z.object({
  applicationId: z.string(),
  decision: z.enum(['approved', 'rejected']),
  reviewNotes: z.string().max(1000).optional(),
  cooldownDays: z.number().min(1).max(365).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // TODO: Check if user has admin/recruiter role

    const body = await request.json();
    const validatedData = ReviewSchema.parse(body);

    // Check if application exists and is pending
    const application = await prisma.application.findUnique({
      where: { id: validatedData.applicationId },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (application.status !== 'pending') {
      return NextResponse.json({ error: 'Application has already been reviewed' }, { status: 409 });
    }

    // Update application status
    const updatedApplication = await prisma.application.update({
      where: { id: validatedData.applicationId },
      data: {
        status: validatedData.decision,
        reviewedAt: new Date(),
      },
    });

    // If rejected, set cooldown period
    if (validatedData.decision === 'rejected' && application.discordId && validatedData.cooldownDays) {
      const cooldownEndDate = new Date();
      cooldownEndDate.setDate(cooldownEndDate.getDate() + validatedData.cooldownDays);

      await prisma.applicationCooldown.upsert({
        where: { discordId: application.discordId },
        update: {
          canReapplyAt: cooldownEndDate,
          reason: validatedData.reviewNotes || 'Application rejected',
          overriddenBy: null,
          overriddenAt: null,
        },
        create: {
          discordId: application.discordId,
          canReapplyAt: cooldownEndDate,
          reason: validatedData.reviewNotes || 'Application rejected',
        },
      });
    }

    // TODO: Send Discord notification to applicant
    // TODO: Clean up Discord channels if rejected
    // TODO: Add member role and update nickname if approved

    return NextResponse.json({
      success: true,
      application: updatedApplication,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors,
      }, { status: 400 });
    }

    console.error('Error reviewing application:', error);
    return NextResponse.json({
      error: 'Failed to review application',
    }, { status: 500 });
  }
}
