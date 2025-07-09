import mongoose from 'mongoose';

const EntrySchema = new mongoose.Schema({
  id: { type: Number, required: true },
  timestamp: { type: Date, required: true },
  type: { type: String, enum: ['IN', 'OUT'], required: true },
  time: { type: String, required: true }
});

const DailyLogSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
    index: true
  },
  entries: [EntrySchema],
  dailyStats: {
    totalWorkMinutes: { type: Number, required: true },
    totalBreakMinutes: { type: Number, required: true },
    isComplete: { type: Boolean, required: true }
  },
  theme: {
    type: String,
    default: 'minimal'
  }
}, {
  timestamps: true // This adds createdAt and updatedAt fields
});

// Create compound index for userId and date to ensure one log per user per day
DailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.models.DailyLog || mongoose.model('DailyLog', DailyLogSchema);
