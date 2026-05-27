import { model, Schema } from 'mongoose';

const userProgressSchema = new Schema(
    {
        user:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
        course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
        completedLectures:[
            {
                lectureId:{ type: Schema.Types.ObjectId },
                completedAt:{ type: Date, default: Date.now },
            }
        ],
        progressPercent:{ type: Number, default: 0 },
    },
    { timestamps: true }
);

// Уникальная пара пользователь + курс
userProgressSchema.index({ user: 1, course: 1 }, { unique: true });

const UserProgress = model('UserProgress', userProgressSchema);
export default UserProgress;
