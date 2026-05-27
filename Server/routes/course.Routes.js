import {Router} from 'express'

import {
    getAllCourse, getLecturesByCourseId, createCourse, updateCourse, removeCourse,
    addLectureToCourseById, removeLecture, updateLecture,
    submitQuiz, getQuiz, markLectureComplete, getMyProgress,
    assignCourse, setCoursePublic, getEmployeesProgress, getAllUsers,
    getNotifications, markNotificationsRead,
} from '../controllers/course.controllers.js';
import { authorizedRoles, isLoggedIn } from '../middlewares/auth.middlewares.js';
import upload, { uploadLecture } from '../middlewares/multer.middleware.js';

// Attaches req.user if token present, but doesn't block unauthenticated requests
import jwt from 'jsonwebtoken';
const optionalAuth = (req, _res, next) => {
    try {
        const token = req.cookies?.token;
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        }
    } catch (_) { /* ignore invalid token */ }
    next();
};

const router = Router();

/**
 * @route GET  / — filtered by role (guest/user/admin)
 * @route POST / — create course (admin only)
 */
router.route('/')
    .get(optionalAuth, getAllCourse)
    .post(isLoggedIn, authorizedRoles('ADMIN'), upload.single('thumbnail'), createCourse);

// ---- Admin: employees & assignment ----
router.get('/admin/employees', isLoggedIn, authorizedRoles('ADMIN'), getEmployeesProgress);
router.get('/admin/users', isLoggedIn, authorizedRoles('ADMIN'), getAllUsers);

// ---- Notifications ----
router.get('/notifications', isLoggedIn, getNotifications);
router.post('/notifications/read', isLoggedIn, markNotificationsRead);

// ---- Progress ----
router.get('/progress/me', isLoggedIn, getMyProgress);
/**
 * @route GET, PUT, DELETE /courses/:id
 * @description Get, update, or remove a course by ID
 * @access Admin only
 */
router.route('/:id')
    .get(isLoggedIn, getLecturesByCourseId)
    .put(
        isLoggedIn,
        authorizedRoles('ADMIN'),
        updateCourse
    )
    .delete(
        isLoggedIn,
        authorizedRoles('ADMIN'),
        removeCourse
    )
    .post(
        isLoggedIn,
        authorizedRoles('ADMIN'),
        uploadLecture,
        addLectureToCourseById
    );

/**
 * @route POST /:id/assign — Admin assigns users to course
 * @route PATCH /:id/public — Admin toggles isPublic
 */
router.post('/:id/assign', isLoggedIn, authorizedRoles('ADMIN'), assignCourse);
router.patch('/:id/public', isLoggedIn, authorizedRoles('ADMIN'), setCoursePublic);

/**
 * @route DELETE /:courseId/lectures/:lectureId — remove lecture
 * @route PUT    /:courseId/lectures/:lectureId — update lecture
 */
router.route('/:courseId/lectures/:lectureId')
    .delete(isLoggedIn, authorizedRoles('ADMIN'), removeLecture)
    .put(isLoggedIn, authorizedRoles('ADMIN'), uploadLecture, updateLecture);

/**
 * @route GET /:id/lectures/:lectureId/quiz
 * @description Get quiz questions (without answers) for a lecture
 */
router.route('/:id/lectures/:lectureId/quiz')
    .get(isLoggedIn, getQuiz);

/**
 * @route POST /:id/lectures/:lectureId/quiz/submit
 * @description Submit quiz answers
 */
router.route('/:id/lectures/:lectureId/quiz/submit')
    .post(isLoggedIn, submitQuiz);

/**
 * @route POST /:id/lectures/:lectureId/complete
 * @description Mark lecture as completed
 */
router.route('/:id/lectures/:lectureId/complete')
    .post(isLoggedIn, markLectureComplete);

export default router;