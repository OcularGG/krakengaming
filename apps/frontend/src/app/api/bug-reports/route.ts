import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// Bug report validation schema
const BugReportSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  severity: z.enum(['Low', 'Medium', 'High', 'Critical']),
  reporterDiscordUsername: z.string().min(1),
  browser: z.string().optional(),
  reporterEmail: z.string().email().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();
    const validatedData = BugReportSchema.parse(body);

    // Create bug report record
    const bugReport = await prisma.bugReport.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        severity: validatedData.severity,
        reporterId: session?.user?.id || 'anonymous',
        environment: validatedData.browser || null,
        status: 'OPEN',
      },
    });

    return NextResponse.json({
      success: true,
      bugReportId: bugReport.id,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors,
      }, { status: 400 });
    }

    console.error('Error submitting bug report:', error);
    return NextResponse.json({
      error: 'Failed to submit bug report',
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');

    const whereClause: any = {};
    if (severity) whereClause.severity = severity;
    if (status) whereClause.status = status;

    const bugReports = await prisma.bugReport.findMany({
      where: whereClause,
      orderBy: [
        { severity: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        reporter: {
          select: {
            username: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ bugReports });
  } catch (error) {
    console.error('Error fetching bug reports:', error);
    return NextResponse.json({
      error: 'Failed to fetch bug reports',
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, assigneeId } = body;

    if (!id || !status) {
      return NextResponse.json({
        error: 'Bug report ID and status are required',
      }, { status: 400 });
    }

    const updatedBugReport = await prisma.bugReport.update({
      where: { id },
      data: {
        status,
        assigneeId: assigneeId || null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      bugReport: updatedBugReport,
    });

  } catch (error) {
    console.error('Error updating bug report:', error);
    return NextResponse.json({
      error: 'Failed to update bug report',
    }, { status: 500 });
  }
}
