import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';

import asyncHandler from '../middlewares/asyncHAndler.middleware.js';
import Course from "../models/course.model.js"
import QuizAttempt from "../models/quizAttempt.model.js";
import User from "../models/usermodel.js";
import UserProgress from "../models/userProgress.model.js";
import AppError from "../utils/error.util.js";

/**
 * @GET_ALL_COURSES
 * ADMIN: all courses.
 * USER (logged in): public courses + courses assigned to them.
 * Guest (not logged in): public courses only.
 */
export const getAllCourse = asyncHandler(async (req, res, next) => {
    try {
        let courses;
        const userId = req.user?.id;
        const role = req.user?.role;

        if (role === 'ADMIN') {
            courses = await Course.find({}).select('-lectures');
        } else if (userId) {
            courses = await Course.find({
                $or: [
                    { isPublic: true },
                    { assignedTo: userId },
                ],
            }).select('-lectures');
        } else {
            courses = await Course.find({ isPublic: true }).select('-lectures');
        }

        res.status(200).json({ success: true, message: 'All course', courses });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @ASSIGN_COURSE
 * Admin assigns or removes a course from specific users.
 * Body: { userIds: string[], action: 'add' | 'remove' }
 */
export const assignCourse = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { userIds, action = 'add' } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return next(new AppError('userIds array is required', 400));
    }

    const course = await Course.findById(id);
    if (!course) return next(new AppError('Course not found', 404));

    if (action === 'add') {
        // Add users not already in assignedTo
        for (const uid of userIds) {
            if (!course.assignedTo.map(String).includes(uid)) {
                course.assignedTo.push(uid);
            }
        }
        // Send notification to each newly assigned user
        await User.updateMany(
            { _id: { $in: userIds } },
            {
                $push: {
                    notifications: {
                        message: `Вам назначен курс: «${course.title}»`,
                        courseId: course._id,
                        read: false,
                        createdAt: new Date(),
                    },
                },
            }
        );
    } else {
        course.assignedTo = course.assignedTo.filter(
            uid => !userIds.includes(uid.toString())
        );
    }

    await course.save();
    res.status(200).json({ success: true, message: 'Course assignment updated', course });
});

/**
 * @SET_COURSE_PUBLIC
 * Toggle isPublic flag for a course.
 * Body: { isPublic: boolean }
 */
export const setCoursePublic = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { isPublic } = req.body;

    const course = await Course.findByIdAndUpdate(
        id,
        { isPublic: Boolean(isPublic) },
        { new: true }
    );
    if (!course) return next(new AppError('Course not found', 404));

    res.status(200).json({
        success: true,
        message: `Курс теперь ${isPublic ? 'открыт для всех' : 'только по назначению'}`,
        course,
    });
});

/**
 * @GET_EMPLOYEES_PROGRESS
 * Admin: get all non-admin users with their progress and quiz attempts.
 */
export const getEmployeesProgress = asyncHandler(async (req, res, next) => {
    const employees = await User.find({ role: 'USER' })
        .select('fullName email avatar notifications')
        .lean();

    const employeeIds = employees.map(e => e._id);

    const [progressList, attempts] = await Promise.all([
        UserProgress.find({ user: { $in: employeeIds } })
            .populate('course', 'title thumbnail numberOfLectures')
            .lean(),
        QuizAttempt.find({ user: { $in: employeeIds } })
            .sort({ createdAt: -1 })
            .lean(),
    ]);

    // Group by user
    const progressByUser = {};
    for (const p of progressList) {
        const uid = p.user.toString();
        if (!progressByUser[uid]) progressByUser[uid] = [];
        progressByUser[uid].push(p);
    }

    const attemptsByUser = {};
    for (const a of attempts) {
        const uid = a.user.toString();
        if (!attemptsByUser[uid]) attemptsByUser[uid] = [];
        if (attemptsByUser[uid].length < 20) attemptsByUser[uid].push(a);
    }

    const result = employees.map(emp => ({
        _id: emp._id,
        fullName: emp.fullName,
        email: emp.email,
        avatar: emp.avatar,
        courses: (progressByUser[emp._id.toString()] || []).map(p => ({
            courseId: p.course?._id,
            title: p.course?.title,
            thumbnail: p.course?.thumbnail,
            totalLectures: p.course?.numberOfLectures ?? 0,
            completedLectures: p.completedLectures?.length ?? 0,
            progressPercent: p.progressPercent ?? 0,
        })),
        quizAttempts: (attemptsByUser[emp._id.toString()] || []).map(a => ({
            courseId: a.course,
            lectureId: a.lectureId,
            score: a.score,
            passed: a.passed,
            date: a.createdAt,
        })),
    }));

    res.status(200).json({ success: true, employees: result });
});

/**
 * @GET_ALL_USERS
 * Admin: list of all non-admin users (for assignment modal).
 */
export const getAllUsers = asyncHandler(async (req, res, next) => {
    const users = await User.find({ role: 'USER' }).select('fullName email avatar').lean();
    res.status(200).json({ success: true, users });
});

/**
 * @GET_NOTIFICATIONS
 * Current user's notifications.
 */
export const getNotifications = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('notifications').lean();
    const sorted = [...(user?.notifications || [])].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    res.status(200).json({ success: true, notifications: sorted });
});

/**
 * @MARK_NOTIFICATIONS_READ
 * Mark all notifications as read.
 */
export const markNotificationsRead = asyncHandler(async (req, res, next) => {
    await User.updateOne(
        { _id: req.user.id },
        { $set: { 'notifications.$[].read': true } }
    );
    res.status(200).json({ success: true });
});
/**
 * @GET_LECTURES_BY_COURSE_ID
 * Fetches lectures for a specific course.
 */
export const getLecturesByCourseId = asyncHandler(async (req, res, next)=>{
    try {
        const {id} = req.params;

        const course = await  Course.findById(id);

        if(!course){
            return next(
                new AppError('Course with given id does not exist', 404)
            )
        }

        res.status(200).json({
            success:true,
            message:'Course lectures fecthed sucesssfully ',
            lectures:course.lectures,
        })
        
        
    } catch (error) {
        return next(
            new AppError(error.message, 500)
        )
    }
});
/**
 * @CREATE_COURSE
 * Creates a new course and optionally uploads a thumbnail image.
 */
export const createCourse = asyncHandler(async (req, res, next)=>{
    const {title, description , category, createdBy}= req.body;
    if(!title||! description ||! category||!createdBy){
        return next(
            new AppError('Alll fields are required ', 400)
        )
    }
    
    const course = await Course.create({
        title,
        description,
        category,
        createdBy,
        thumbnail:{
            public_id:'Dummy',
            secure_url:'Dummy'
        },
    });

    if(!course){
        return next(
            new AppError('Course could not created please try again  ', 500)
        )
    }

    if(req.file){
        try {
            const result = await cloudinary.uploader.upload(req.file.path,{
                folder:'lms'
            });
            if(result){
                course.thumbnail.public_id=result.public_id;
                course.thumbnail.secure_url=result.secure_url;
            }
            await fs.rm(`uploads/${req.file.filename}`);
        }catch (error) {
            // In local/dev environment Cloudinary credentials may be dummy.
            // Do not fail the whole request if upload fails; keep dummy thumbnail.
            console.error('Cloudinary upload error in createCourse:', error.message);
        }
    }

    await course.save();
    
    res.status(200).json({
        success:true,
        message:'Course created sucesssfully ',
        course,
    })
    
});
/**
 * @UPDATE_COURSE_BY_ID
 * Updates an existing course by ID.
 */
export const updateCourse = asyncHandler(async (req, res, next)=>{
    try {
        const {id}= req.params;

    const course =  await Course.findByIdAndUpdate(
        id,
        {
            $set:req.body
        },
        {
            runValidators: true
        }
    )   
    if(!course){
        return next (
            new AppError("Course with given id does not exist", 500)
        ) 
    }
    
    } catch (error) {
        return next (
            new AppError(error.message, 500)
        )
    }
    res.status(200).json({
        success:true,
        message:'Course Updated sucesssfully ',
    })
});
/**
 * @DELETE_COURSE_BY_ID
 * Deletes a course by its ID.
 */
export const removeCourse = asyncHandler(async (req, res, next)=>{
    try {
        const {id }= req.params;
        const course = await  Course.findById(id);
        if(!course){
            return next (
                new AppError("Course with given id does not exist", 500)
            ) 
        }
        
        await Course.findByIdAndDelete(id);

        res.status(200).json({
            success:true,
            message:'Course Removed sucesssfully ',
        })
        
    } catch (error) {
        return next (
            new AppError(error.message, 500)
        )
    }
});
/**
 * @ADD_LECTURE
 * Adds a lecture to a course.
 * Supports: optional video upload, text/link materials (JSON), file materials (multipart),
 * and a quiz (JSON).
 * req.files is an object: { lecture?: [File], materialFiles?: [File] }
 */
export const addLectureToCourseById = asyncHandler(async (req, res, next) => {
    const { title, description, materials: materialsJson, quiz: quizJson } = req.body;
    const { id } = req.params;

    if (!title || !description) {
        return next(new AppError('Title and description are required', 400));
    }

    const course = await Course.findById(id);
    if (!course) {
        return next(new AppError('Course does not exist', 404));
    }

    const lectureData = {
        title,
        description,
        lecture: { public_id: '', secure_url: '' },
        materials: [],
        quiz: undefined,
    };

    // --- Video upload (optional) ---
    const videoFile = req.files?.lecture?.[0];
    if (videoFile) {
        try {
            const result = await cloudinary.uploader.upload(videoFile.path, {
                folder: 'lms',
                chunk_size: 50000000,
                resource_type: 'video',
            });
            lectureData.lecture.public_id = result.public_id;
            lectureData.lecture.secure_url = result.secure_url;
            fs.rm(videoFile.path).catch(() => {});
        } catch (error) {
            return next(new AppError(error.message, 500));
        }
    }

    // --- Text/link materials from JSON ---
    let parsedMaterials = [];
    if (materialsJson) {
        try {
            parsedMaterials = JSON.parse(materialsJson);
        } catch {
            return next(new AppError('Invalid materials JSON', 400));
        }
    }

    // --- File materials upload ---
    const materialFiles = req.files?.materialFiles || [];
    let fileIdx = 0;

    for (const mat of parsedMaterials) {
        if (mat.type === 'file') {
            const f = materialFiles[fileIdx];
            if (f) {
                try {
                    const result = await cloudinary.uploader.upload(f.path, {
                        folder: 'lms/materials',
                        resource_type: 'raw',
                    });
                    mat.file = {
                        public_id: result.public_id,
                        secure_url: result.secure_url,
                        originalName: Buffer.from(f.originalname, 'latin1').toString('utf8'),
                    };
                    fs.rm(f.path).catch(() => {});
                } catch (error) {
                    return next(new AppError(error.message, 500));
                }
                fileIdx++;
            }
        }
        lectureData.materials.push(mat);
    }

    // --- Quiz ---
    if (quizJson) {
        try {
            lectureData.quiz = JSON.parse(quizJson);
        } catch {
            return next(new AppError('Invalid quiz JSON', 400));
        }
    }

    course.lectures.push(lectureData);
    course.numberOfLectures = course.lectures.length;
    await course.save();

    res.status(200).json({
        success: true,
        message: 'Lecture added successfully',
        lecture: course.lectures[course.lectures.length - 1],
    });
});

/**
 * @UPDATE_LECTURE
 * Updates title, description, video (optional), materials, quiz of an existing lecture.
 * req.files: { lecture?: [File], materialFiles?: [File] }
 */
export const updateLecture = asyncHandler(async (req, res, next) => {
    const { courseId, lectureId } = req.params;
    const { title, description, materials: materialsJson, quiz: quizJson, keepVideo } = req.body;

    if (!title || !description) {
        return next(new AppError('Title and description are required', 400));
    }

    const course = await Course.findById(courseId);
    if (!course) return next(new AppError('Course not found', 404));

    const lecture = course.lectures.id(lectureId);
    if (!lecture) return next(new AppError('Lecture not found', 404));

    lecture.title = title;
    lecture.description = description;

    // --- Video: upload new if provided, otherwise keep/clear ---
    const videoFile = req.files?.lecture?.[0];
    if (videoFile) {
        // Delete old video from Cloudinary if exists
        if (lecture.lecture?.public_id) {
            await cloudinary.uploader.destroy(lecture.lecture.public_id, { resource_type: 'video' }).catch(() => {});
        }
        try {
            const result = await cloudinary.uploader.upload(videoFile.path, {
                folder: 'lms',
                chunk_size: 50000000,
                resource_type: 'video',
            });
            lecture.lecture.public_id = result.public_id;
            lecture.lecture.secure_url = result.secure_url;
            fs.rm(videoFile.path).catch(() => {});
        } catch (error) {
            return next(new AppError(error.message, 500));
        }
    } else if (keepVideo === 'false') {
        // Admin explicitly removed the video
        if (lecture.lecture?.public_id) {
            await cloudinary.uploader.destroy(lecture.lecture.public_id, { resource_type: 'video' }).catch(() => {});
        }
        lecture.lecture = { public_id: '', secure_url: '' };
    }
    // else: keepVideo === 'true' — keep existing lecture.lecture as-is

    // --- Materials ---
    let parsedMaterials = [];
    if (materialsJson) {
        try {
            parsedMaterials = JSON.parse(materialsJson);
        } catch {
            return next(new AppError('Invalid materials JSON', 400));
        }
    }

    const materialFiles = req.files?.materialFiles || [];
    let fileIdx = 0;

    const newMaterials = [];
    for (const mat of parsedMaterials) {
        if (mat.type === 'file') {
            if (mat._existingFile) {
                // Keep already-uploaded file (passed back from frontend)
                newMaterials.push({
                    type: 'file',
                    title: mat.title,
                    file: mat._existingFile,
                });
            } else {
                const f = materialFiles[fileIdx];
                if (f) {
                    try {
                        const result = await cloudinary.uploader.upload(f.path, {
                            folder: 'lms/materials',
                            resource_type: 'raw',
                        });
                        newMaterials.push({
                            type: 'file',
                            title: mat.title,
                            file: {
                                public_id: result.public_id,
                                secure_url: result.secure_url,
                                originalName: Buffer.from(f.originalname, 'latin1').toString('utf8'),
                            },
                        });
                        fs.rm(f.path).catch(() => {});
                    } catch (error) {
                        return next(new AppError(error.message, 500));
                    }
                    fileIdx++;
                }
            }
        } else {
            const { _existingFile, ...rest } = mat;
            newMaterials.push(rest);
        }
    }
    lecture.materials = newMaterials;

    // --- Quiz ---
    if (quizJson !== undefined) {
        try {
            const parsed = JSON.parse(quizJson);
            lecture.quiz = parsed && parsed.questions?.length > 0 ? parsed : undefined;
        } catch {
            return next(new AppError('Invalid quiz JSON', 400));
        }
    }

    await course.save();

    res.status(200).json({
        success: true,
        message: 'Lecture updated successfully',
        lecture,
    });
});

/**
 * @SUBMIT_QUIZ
 * Accepts user answers for a lecture quiz, calculates score, saves QuizAttempt.
 */
export const submitQuiz = asyncHandler(async (req, res, next) => {
    const { id: courseId, lectureId } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;

    if (!answers || !Array.isArray(answers)) {
        return next(new AppError('Answers array is required', 400));
    }

    const course = await Course.findById(courseId);
    if (!course) return next(new AppError('Course not found', 404));

    const lecture = course.lectures.id(lectureId);
    if (!lecture) return next(new AppError('Lecture not found', 404));

    if (!lecture.quiz || !lecture.quiz.questions?.length) {
        return next(new AppError('This lecture has no quiz', 400));
    }

    const { questions, passingScore = 70 } = lecture.quiz;
    let correct = 0;

    answers.forEach(({ questionIndex, selectedIndex }) => {
        if (
            questionIndex >= 0 &&
            questionIndex < questions.length &&
            questions[questionIndex].correctIndex === selectedIndex
        ) {
            correct++;
        }
    });

    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= passingScore;

    await QuizAttempt.create({
        user: userId,
        course: courseId,
        lectureId,
        score,
        passed,
        answers,
    });

    // If passed — mark lecture as completed in UserProgress
    if (passed) {
        await _markLectureCompleted(userId, courseId, lectureId, course.numberOfLectures);
    }

    // Return questions with correctIndex revealed (after attempt)
    const result = questions.map((q, idx) => ({
        text: q.text,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        yourAnswer: answers.find(a => a.questionIndex === idx)?.selectedIndex,
    }));

    res.status(200).json({
        success: true,
        score,
        passed,
        passingScore,
        result,
    });
});

/**
 * @GET_QUIZ
 * Returns quiz questions for a lecture WITHOUT correctIndex (for students).
 */
export const getQuiz = asyncHandler(async (req, res, next) => {
    const { id: courseId, lectureId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) return next(new AppError('Course not found', 404));

    const lecture = course.lectures.id(lectureId);
    if (!lecture) return next(new AppError('Lecture not found', 404));

    if (!lecture.quiz || !lecture.quiz.questions?.length) {
        return res.status(200).json({ success: true, quiz: null });
    }

    const safeQuestions = lecture.quiz.questions.map(q => ({
        text: q.text,
        options: q.options,
    }));

    res.status(200).json({
        success: true,
        quiz: {
            title: lecture.quiz.title,
            passingScore: lecture.quiz.passingScore,
            questions: safeQuestions,
        },
    });
});

/**
 * @MARK_LECTURE_COMPLETE
 * Marks a lecture as completed for the current user (without quiz or after passing quiz).
 */
export const markLectureComplete = asyncHandler(async (req, res, next) => {
    const { id: courseId, lectureId } = req.params;
    const userId = req.user.id;

    const course = await Course.findById(courseId);
    if (!course) return next(new AppError('Course not found', 404));

    const lecture = course.lectures.id(lectureId);
    if (!lecture) return next(new AppError('Lecture not found', 404));

    await _markLectureCompleted(userId, courseId, lectureId, course.numberOfLectures);

    res.status(200).json({ success: true, message: 'Lecture marked as completed' });
});

/**
 * @GET_MY_PROGRESS
 * Returns progress for all courses the user has started.
 */
export const getMyProgress = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;

    const progressList = await UserProgress.find({ user: userId })
        .populate('course', 'title thumbnail numberOfLectures');

    // Attach last quiz attempts per course
    const attempts = await QuizAttempt.find({ user: userId })
        .sort({ createdAt: -1 })
        .lean();

    const attemptsByCourse = {};
    for (const a of attempts) {
        const key = a.course.toString();
        if (!attemptsByCourse[key]) attemptsByCourse[key] = [];
        if (attemptsByCourse[key].length < 5) attemptsByCourse[key].push(a);
    }

    const data = progressList.map(p => ({
        course: p.course,
        completedLectures: p.completedLectures.length,
        progressPercent: p.progressPercent,
        recentAttempts: attemptsByCourse[p.course._id?.toString()] || [],
    }));

    res.status(200).json({ success: true, progress: data });
});

// --- Helper ---
async function _markLectureCompleted(userId, courseId, lectureId, totalLectures) {
    let progress = await UserProgress.findOne({ user: userId, course: courseId });

    if (!progress) {
        progress = new UserProgress({ user: userId, course: courseId, completedLectures: [] });
    }

    const alreadyDone = progress.completedLectures.some(
        c => c.lectureId.toString() === lectureId.toString()
    );

    if (!alreadyDone) {
        progress.completedLectures.push({ lectureId });
    }

    if (totalLectures > 0) {
        progress.progressPercent = Math.round(
            (progress.completedLectures.length / totalLectures) * 100
        );
    }

    await progress.save();
}
/**
 * @REMOVE_LECTURE
 * Removes a lecture from a course by its ID and deletes the video from Cloudinary.
 */
export const removeLecture =asyncHandler( async(req, res, next )=>{
    try {
        const courseId = req.params.courseId;
        const lectureId = req.params.lectureId;

        const course = await Course.findById(courseId);
        if (!course) {
            return next(new AppError('Course not found', 404));
        }

        // Find the index of the lecture in the array
        const lectureIndex = course.lectures.findIndex(
            (lecture) => lecture._id.toString() === lectureId
        );

        if (lectureIndex === -1) {
            return next(new AppError('Lecture not found', 404));
        }
         // Delete the lecture from cloudinary
        await cloudinary.uploader.destroy(
            course.lectures[lectureIndex].lecture.public_id,
            {
            resource_type: 'video',
            }
        );
        // Remove the lecture from the array
        course.lectures.splice(lectureIndex, 1);
        course.numberOfLectures -= 1;
        
        await course.save();

        res.status(200).json({
            success: true,
            message: 'Lecture removed successfully',
        });

    }catch (error) {
        return next (
            new AppError(error.message, 500)
        )
    }
});