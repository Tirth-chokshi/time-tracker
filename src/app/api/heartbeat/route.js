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

// Import the UserSession model from session route
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
  lastActiveDate: { type: String, required: true },
  lastActivity: { type: Date, default: Date.now },
  sessionStartTime: { type: Number, default: null },
}, {
  timestamps: true
});

userSessionSchema.index({ userId: 1 });
userSessionSchema.index({ lastActiveDate: 1 });

const UserSession = mongoose.models.UserSession || mongoose.model('UserSession', userSessionSchema);

// POST - Send heartbeat to keep session alive and update last activity
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { timestamp } = await request.json();
    const today = new Date().toISOString().split('T')[0];

    // Update last activity timestamp
    await UserSession.findOneAndUpdate(
      { 
        userId: session.user.id,
        lastActiveDate: today 
      },
      {
        lastActivity: new Date(timestamp || Date.now())
      },
      { upsert: false }
    );

    return NextResponse.json({
      success: true,
      message: 'Heartbeat received',
      serverTime: Date.now()
    });

  } catch (error) {
    console.error('Error processing heartbeat:', error);
    return NextResponse.json(
      { error: 'Failed to process heartbeat' },
      { status: 500 }
    );
  }
}
