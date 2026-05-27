import { useEffect, useState } from "react";
import { MdAutoDelete, MdCheckCircle, MdEdit } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import HomeLayout from "../../Layouts/HomeLayout";
import { deleteCourseLecture, getCourseLectures, getQuiz, submitQuiz, markLectureComplete } from "../../Redux/Slices/LectureSlice";

function Displaylectures() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { state } = useLocation();
    const { lectures } = useSelector((state) => state.lecture);
    const { role } = useSelector((state) => state.auth);

    const [currentVideo, setCurrentVideo] = useState(0);
    const [completedIds, setCompletedIds] = useState([]);

    // Quiz state
    const [quizData, setQuizData] = useState(null);   // { title, passingScore, questions[] }
    const [quizResult, setQuizResult] = useState(null); // { score, passed, result[] }
    const [quizAnswers, setQuizAnswers] = useState({}); // { questionIndex: selectedIndex }
    const [quizVisible, setQuizVisible] = useState(false);
    const [quizSubmitting, setQuizSubmitting] = useState(false);

    const lecture = lectures?.[currentVideo];

    // ---- Actions ----

    async function onLectureDelete(courseId, lectureId) {
        if (window.confirm("Вы уверены, что хотите удалить эту лекцию?")) {
            await dispatch(deleteCourseLecture({ courseId, lectureId }));
            await dispatch(getCourseLectures(courseId));
        }
    }

    async function handleSelectLecture(idx) {
        setCurrentVideo(idx);
        setQuizData(null);
        setQuizResult(null);
        setQuizAnswers({});
        setQuizVisible(false);
    }

    async function handleOpenQuiz() {
        if (quizData) {
            setQuizVisible(true);
            return;
        }
        const res = await dispatch(getQuiz({ courseId: state._id, lectureId: lecture._id }));
        if (res?.payload?.quiz) {
            setQuizData(res.payload.quiz);
            setQuizAnswers({});
            setQuizResult(null);
            setQuizVisible(true);
        } else {
            // no quiz
        }
    }

    async function handleSubmitQuiz(e) {
        e.preventDefault();
        const { questions } = quizData;
        const answered = Object.keys(quizAnswers).length;
        if (answered < questions.length) {
            alert(`Ответьте на все вопросы (осталось: ${questions.length - answered})`);
            return;
        }
        setQuizSubmitting(true);
        const answers = Object.entries(quizAnswers).map(([qi, si]) => ({
            questionIndex: Number(qi),
            selectedIndex: Number(si),
        }));
        const res = await dispatch(submitQuiz({ courseId: state._id, lectureId: lecture._id, answers }));
        setQuizSubmitting(false);
        if (res?.payload) {
            setQuizResult(res.payload);
            if (res.payload.passed) {
                setCompletedIds(p => [...new Set([...p, lecture._id])]);
            }
        }
    }

    async function handleMarkComplete() {
        const res = await dispatch(markLectureComplete({ courseId: state._id, lectureId: lecture._id }));
        if (res?.payload?.success) {
            setCompletedIds(p => [...new Set([...p, lecture._id])]);
        }
    }

    useEffect(() => {
        if (!state) navigate("/courses");
        else dispatch(getCourseLectures(state._id));
    }, []);

    useEffect(() => {
        // Reset quiz state when switching lecture
        setQuizData(null);
        setQuizResult(null);
        setQuizAnswers({});
        setQuizVisible(false);
    }, [currentVideo]);

    const isCompleted = lecture && completedIds.includes(lecture._id);

    return (
        <HomeLayout>
            <div className="flex flex-col gap-6 items-center min-h-[90vh] py-8 bg-gradient-to-br from-white to-primary-50 px-3 sm:px-6 w-full overflow-x-hidden">
                <div className="text-center text-lg sm:text-2xl font-bold text-primary-700 bg-white px-4 py-3 rounded-xl shadow-sm border border-primary-100 w-full max-w-6xl">
                    {state?.title}
                </div>

                {lectures && lectures.length > 0 ? (
                    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-6xl">

                        {/* ===== Left: Video + Materials + Quiz ===== */}
                        <div className="flex flex-col gap-4 lg:flex-1 min-w-0">

                            {/* Video */}
                            <div className="bg-white p-5 rounded-2xl shadow-md border border-primary-100 space-y-3">
                                {lecture?.lecture?.secure_url ? (
                                    <video
                                        key={lecture._id}
                                        src={lecture.lecture.secure_url}
                                        className="w-full rounded-xl object-fill max-h-80 border border-primary-100"
                                        controls disablePictureInPicture muted
                                        controlsList="nodownload"
                                    />
                                ) : (
                                    <div className="w-full h-44 rounded-xl bg-primary-50 border border-primary-200 flex items-center justify-center text-primary-400 font-semibold">
                                        Видео не прикреплено
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <h3 className="font-semibold text-gray-900">
                                        <span className="text-primary-600">Тема: </span>
                                        {lecture?.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        <span className="text-primary-600 font-semibold">Описание: </span>
                                        {lecture?.description}
                                    </p>
                                </div>

                                {/* Complete / completed status */}
                                {role !== "ADMIN" && (
                                    <div className="pt-1">
                                        {isCompleted ? (
                                            <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
                                                <MdCheckCircle className="text-xl" /> Лекция завершена
                                            </div>
                                        ) : !lecture?.quiz?.questions?.length && (
                                            <button
                                                onClick={handleMarkComplete}
                                                className="text-sm bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-lg font-semibold transition-colors"
                                            >
                                                Отметить как просмотрено
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Materials */}
                            {lecture?.materials?.length > 0 && (
                                <div className="bg-white p-5 rounded-2xl shadow-md border border-primary-100 space-y-3">
                                    <h4 className="font-bold text-gray-900 text-base">Материалы к лекции</h4>
                                    <div className="flex flex-col gap-3">
                                        {lecture.materials.map((mat, idx) => (
                                            <div key={idx} className="border border-gray-100 rounded-xl p-3 bg-gray-50">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${mat.type === 'text' ? 'bg-blue-100 text-blue-700' : mat.type === 'link' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                        {mat.type === 'text' ? 'Текст' : mat.type === 'link' ? 'Ссылка' : 'Файл'}
                                                    </span>
                                                    <span className="font-semibold text-gray-800 text-sm">{mat.title}</span>
                                                </div>

                                                {mat.type === 'text' && (
                                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{mat.content}</p>
                                                )}
                                                {mat.type === 'link' && (
                                                    <a href={mat.url} target="_blank" rel="noopener noreferrer"
                                                        className="text-sm text-primary-600 hover:text-primary-800 underline break-all">
                                                        {mat.url}
                                                    </a>
                                                )}
                                                {mat.type === 'file' && mat.file?.secure_url && (
                                                    <a href={mat.file.secure_url} target="_blank" rel="noopener noreferrer"
                                                        className="text-sm text-primary-600 hover:text-primary-800 underline">
                                                        ⬇ {mat.file.originalName || "Скачать файл"}
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quiz block */}
                            {role !== "ADMIN" && lecture?.quiz?.questions?.length > 0 && (
                                <div className="bg-white p-5 rounded-2xl shadow-md border border-primary-100">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-bold text-gray-900 text-base">
                                            {lecture.quiz?.title || "Тест к лекции"}
                                        </h4>
                                        <span className="text-xs text-gray-500">
                                            Проходной балл: {lecture.quiz?.passingScore ?? 70}%
                                        </span>
                                    </div>

                                    {/* Already submitted result */}
                                    {quizResult ? (
                                        <div className="space-y-4">
                                            <div className={`text-center py-3 rounded-xl font-bold text-lg ${quizResult.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                                {quizResult.passed ? '✓ Тест сдан!' : '✗ Не сдан'}
                                                {" "}— {quizResult.score}%
                                            </div>

                                            {/* Detailed results */}
                                            <div className="flex flex-col gap-3">
                                                {quizResult.result?.map((q, qi) => (
                                                    <div key={qi} className="border rounded-xl p-3 text-sm">
                                                        <p className="font-semibold text-gray-800 mb-2">{qi + 1}. {q.text}</p>
                                                        <div className="flex flex-col gap-1">
                                                            {q.options.map((opt, oi) => {
                                                                const isCorrect = oi === q.correctIndex;
                                                                const isYours = oi === q.yourAnswer;
                                                                let cls = "px-3 py-1.5 rounded-lg text-sm";
                                                                if (isCorrect) cls += " bg-green-100 text-green-800 font-semibold";
                                                                else if (isYours && !isCorrect) cls += " bg-red-100 text-red-700 line-through";
                                                                else cls += " text-gray-600";
                                                                return (
                                                                    <div key={oi} className={cls}>
                                                                        {isCorrect ? "✓ " : isYours ? "✗ " : "  "}{opt}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                        {q.explanation && (
                                                            <p className="mt-2 text-xs text-gray-500 italic">{q.explanation}</p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex gap-3 flex-wrap">
                                                {quizResult.passed ? (
                                                    <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
                                                        <MdCheckCircle className="text-xl" /> Лекция засчитана
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => { setQuizResult(null); setQuizAnswers({}); }}
                                                        className="text-sm bg-primary-600 hover:bg-primary-700 text-white px-4 py-1.5 rounded-lg font-semibold transition-colors"
                                                    >
                                                        Попробовать снова
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ) : quizVisible && quizData ? (
                                        /* Quiz form */
                                        <form onSubmit={handleSubmitQuiz} className="flex flex-col gap-4">
                                            {quizData.questions.map((q, qi) => (
                                                <div key={qi} className="border rounded-xl p-3 text-sm">
                                                    <p className="font-semibold text-gray-800 mb-2">{qi + 1}. {q.text}</p>
                                                    <div className="flex flex-col gap-1.5">
                                                        {q.options.map((opt, oi) => (
                                                            <label key={oi} className="flex items-center gap-2 cursor-pointer hover:bg-primary-50 px-2 py-1 rounded-lg">
                                                                <input
                                                                    type="radio"
                                                                    name={`q-${qi}`}
                                                                    value={oi}
                                                                    checked={quizAnswers[qi] === oi}
                                                                    onChange={() => setQuizAnswers(p => ({ ...p, [qi]: oi }))}
                                                                    className="accent-primary-600 w-4 h-4"
                                                                />
                                                                <span className="text-gray-700">{opt}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="flex gap-3">
                                                <button type="submit" disabled={quizSubmitting}
                                                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-semibold transition-colors disabled:opacity-60">
                                                    {quizSubmitting ? "Проверяем..." : "Отправить ответы"}
                                                </button>
                                                <button type="button" onClick={() => setQuizVisible(false)}
                                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                                                    Отмена
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <button
                                            onClick={handleOpenQuiz}
                                            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-xl font-semibold transition-colors"
                                        >
                                            Пройти тест
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ===== Right: Lecture list ===== */}
                        <div className="w-full lg:w-80 lg:flex-shrink-0 bg-white p-4 rounded-2xl shadow-md border border-primary-100 flex flex-col gap-3 lg:self-start">
                            <div className="flex items-center justify-between">
                                <p className="font-bold text-base text-gray-900">Список лекций</p>
                                {role === "ADMIN" && (
                                    <button
                                        onClick={() => navigate("/course/addlecture", { state: { ...state } })}
                                        className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-lg font-semibold text-sm transition-all duration-300"
                                    >
                                        + Добавить
                                    </button>
                                )}
                            </div>
                            <ul className="space-y-2 overflow-y-auto max-h-60 lg:max-h-[28rem]">
                                {lectures.map((lec, idx) => (
                                    <li
                                        key={lec._id}
                                        className={`flex justify-between items-center p-2.5 rounded-xl cursor-pointer transition-colors ${idx === currentVideo ? 'bg-primary-100 border border-primary-300' : 'hover:bg-primary-50 border border-gray-100'}`}
                                        onClick={() => handleSelectLecture(idx)}
                                    >
                                        <p className="text-gray-800 text-sm font-medium flex items-center gap-2 min-w-0 flex-1">
                                            {completedIds.includes(lec._id) && (
                                                <MdCheckCircle className="text-green-500 flex-shrink-0" />
                                            )}
                                            <span className="text-primary-600 font-semibold flex-shrink-0">{idx + 1}.&nbsp;</span>
                                            <span className="truncate">{lec?.title}</span>
                                        </p>
                                        {role === "ADMIN" && (
                                            <div className="flex items-center gap-1 ml-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                                                <button
                                                    title="Редактировать лекцию"
                                                    onClick={() => navigate("/course/editlecture", { state: { course: state, lecture: lec } })}
                                                    className="text-primary-500 hover:text-primary-700 text-lg transition-colors"
                                                >
                                                    <MdEdit />
                                                </button>
                                                <button
                                                    title="Удалить лекцию"
                                                    onClick={() => onLectureDelete(state?._id, lec?._id)}
                                                    className="text-red-400 hover:text-red-600 text-xl transition-colors"
                                                >
                                                    <MdAutoDelete />
                                                </button>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ) : (
                    role === "ADMIN" && (
                        <div className="flex flex-col items-center gap-4">
                            <p className="text-gray-500">Лекции ещё не добавлены</p>
                            <button
                                onClick={() => navigate("/course/addlecture", { state: { ...state } })}
                                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg font-semibold text-lg transition-all duration-300 shadow-md"
                            >
                                Добавить первую лекцию
                            </button>
                        </div>
                    )
                )}
            </div>
        </HomeLayout>
    );
}

export default Displaylectures;
