import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import GoogleProvider from 'next-auth/providers/google';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token
        token.id = profile.sub
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      session.user.id = token.id
      return session
    },
    async signIn({ account, profile }) {
      if (account.provider === "google") {
        return profile.email_verified && profile.email.endsWith("@gmail.com")
      }
      return true
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// User Session Schema for storing current state
const userSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  userEmail: { type: String, required: true },
  userName: { type: String, required: true },
  currentStatus: { type: String, enum: ['IN', 'OUT'], default: 'OUT' },
  entries: [{ 
    id: Number,
    timestamp: Number,
    type: { type: String, enum: ['IN', 'OUT'] },
    time: String
  }],
  dailyStats: {
    totalWorkMinutes: { type: Number, default: 0 },
    totalBreakMinutes: { type: Number, default: 0 },
    isComplete: { type: Boolean, default: false }
  },
  currentTheme: { type: String, default: 'minimal' },
  lastActiveDate: { type: String, required: true }, // YYYY-MM-DD format
  lastActivity: { type: Date, default: Date.now },
  sessionStartTime: { type: Number, default: null }, // Timestamp when current session started
}, {
  timestamps: true
});

userSessionSchema.index({ userId: 1 });
userSessionSchema.index({ lastActiveDate: 1 });

const UserSession = mongoose.models.UserSession || mongoose.model('UserSession', userSessionSchema);

// GET - Fetch current session state
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const today = new Date().toISOString().split('T')[0];
    
    let userSession = await UserSession.findOne({ userId: session.user.id });

    // If no session exists or it's a new day, create/reset session
    if (!userSession || userSession.lastActiveDate !== today) {
      userSession = await UserSession.findOneAndUpdate(
        { userId: session.user.id },
        {
          userId: session.user.id,
          userEmail: session.user.email,
          userName: session.user.name,
          currentStatus: 'OUT',
          entries: [],
          dailyStats: {
            totalWorkMinutes: 0,
            totalBreakMinutes: 0,
            isComplete: false
          },
          currentTheme: userSession?.currentTheme || 'minimal', // Preserve theme
          lastActiveDate: today,
          lastActivity: new Date(),
          sessionStartTime: null
        },
        { 
          upsert: true, 
          new: true,
          setDefaultsOnInsert: true
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: userSession
    });

  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

// POST - Update session state
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { 
      currentStatus, 
      entries, 
      dailyStats, 
      currentTheme, 
      sessionStartTime 
    } = await request.json();

    const today = new Date().toISOString().split('T')[0];

    const updatedSession = await UserSession.findOneAndUpdate(
      { userId: session.user.id },
      {
        userId: session.user.id,
        userEmail: session.user.email,
        userName: session.user.name,
        currentStatus: currentStatus || 'OUT',
        entries: entries || [],
        dailyStats: dailyStats || {
          totalWorkMinutes: 0,
          totalBreakMinutes: 0,
          isComplete: false
        },
        currentTheme: currentTheme || 'minimal',
        lastActiveDate: today,
        lastActivity: new Date(),
        sessionStartTime: sessionStartTime || null
      },
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Session updated successfully',
      data: updatedSession
    });

  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}

// DELETE - Reset current session
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const today = new Date().toISOString().split('T')[0];

    await UserSession.findOneAndUpdate(
      { userId: session.user.id },
      {
        currentStatus: 'OUT',
        entries: [],
        dailyStats: {
          totalWorkMinutes: 0,
          totalBreakMinutes: 0,
          isComplete: false
        },
        lastActiveDate: today,
        lastActivity: new Date(),
        sessionStartTime: null
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Session reset successfully'
    });

  } catch (error) {
    console.error('Error resetting session:', error);
    return NextResponse.json(
      { error: 'Failed to reset session' },
      { status: 500 }
    );
  }
}
    