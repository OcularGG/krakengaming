import { NextRequest, NextResponse } from 'next/server';

// In-memory storage (shared with main gallery route in production use database)
const votes: { id: string; galleryItemId: string; userId: string; voteType: 'upvote' | 'downvote'; createdAt: string }[] = [];

// Import the gallery items from the main route to update vote counts
async function updateVoteCounts(_itemId: string) {
  // In a real app, this would update the database
  // For now, we'll handle this in the main API route
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const { itemId, voteType, userId } = await request.json();

    if (!itemId || !voteType || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['upvote', 'downvote'].includes(voteType)) {
      return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 });
    }

    // Check if user already voted on this item
    const existingVoteIndex = votes.findIndex(
      vote => vote.galleryItemId === itemId && vote.userId === userId
    );

    if (existingVoteIndex !== -1) {
      // User already voted, update the vote
      votes[existingVoteIndex] = {
        ...votes[existingVoteIndex],
        voteType,
        createdAt: new Date().toISOString()
      };
    } else {
      // New vote
      const newVote = {
        id: Date.now().toString(),
        galleryItemId: itemId,
        userId,
        voteType,
        createdAt: new Date().toISOString()
      };
      votes.push(newVote);
    }

    await updateVoteCounts(itemId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Vote POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { itemId, userId } = await request.json();

    if (!itemId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Remove user's vote
    const voteIndex = votes.findIndex(
      vote => vote.galleryItemId === itemId && vote.userId === userId
    );

    if (voteIndex !== -1) {
      votes.splice(voteIndex, 1);
      await updateVoteCounts(itemId);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Vote DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const itemId = searchParams.get('itemId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    let userVotes = votes.filter(vote => vote.userId === userId);

    if (itemId) {
      userVotes = userVotes.filter(vote => vote.galleryItemId === itemId);
    }

    return NextResponse.json({ votes: userVotes }, { status: 200 });
  } catch (error) {
    console.error('Vote GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
