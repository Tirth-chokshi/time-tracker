import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import GoogleProvider from 'next-auth/providers/google';
import dbConnect from '@/lib/mongodb';
import DailyLog from '@/models/DailyLog';

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

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { entries, dailyStats, theme, date } = await request.json();

    if (!entries || !dailyStats || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if a log for this user and date already exists
    const existingLog = await DailyLog.findOne({
      userId: session.user.id,
      date: date
    });

    if (existingLog) {
      // Update existing log
      existingLog.entries = entries;
      existingLog.dailyStats = dailyStats;
      existingLog.theme = theme || 'minimal';
      await existingLog.save();
      
      return NextResponse.json({ 
        message: 'Daily log updated successfully', 
        log: existingLog 
      });
    } else {
      // Create new log
      const dailyLog = new DailyLog({
        userId: session.user.id,
        userEmail: session.user.email,
        userName: session.user.name,
        date: date,
        entries: entries,
        dailyStats: dailyStats,
        theme: theme || 'minimal'
      });

      await dailyLog.save();

      return NextResponse.json({ 
        message: 'Daily log saved successfully', 
        log: dailyLog 
      });
    }
  } catch (error) {
    console.error('Error saving daily log:', error);
    return NextResponse.json(
      { error: 'Failed to save daily log' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const limit = parseInt(searchParams.get('limit')) || 30;
    const page = parseInt(searchParams.get('page')) || 1;

    let query = { userId: session.user.id };
    
    if (date) {
      query.date = date;
    }

    const skip = (page - 1) * limit;

    const logs = await DailyLog.find(query)
      .sort({ date: -1 }) // Most recent first
      .skip(skip)
      .limit(limit)
      .lean();

    const totalLogs = await DailyLog.countDocuments(query);
    const totalPages = Math.ceil(totalLogs / limit);

    return NextResponse.json({
      logs,
      pagination: {
        currentPage: page,
        totalPages,
        totalLogs,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching daily logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily logs' },
      { status: 500 }
    );
  }
}
