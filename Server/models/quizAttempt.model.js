import { model, Schema } from 'mongoose';

const quizAttemptSchema = new Schema(
    {
        user:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
        course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
        lectureId: { type: Schema.Types.ObjectId, required: true },
        score:  { type: Number, required: true },
        passed: { type: Boolean, required: true },
        answers:[
            {
                questionIndex:{ type:Number },
                selectedIndex:{ type:Number },
            }
        ],
    },
    { timestamps: true }
);

const QuizAttempt = model('QuizAttempt', quizAttemptSchema);
export default QuizAttempt;
