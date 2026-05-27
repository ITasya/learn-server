import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AiOutlineArrowLeft, AiOutlinePlus, AiOutlineDelete } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import HomeLayout from "../../Layouts/HomeLayout";
import { addCourseLectures } from "../../Redux/Slices/LectureSlice";

const emptyQuestion = () => ({
    text: "",
    options: ["", "", "", ""],
    correctIndex: 0,
    explanation: "",
});

function AddCourseLectures() {
    const courseDetails = useLocation().state;
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("main"); // main | materials | quiz

    // --- Main ---
    const [userInput, setUserInput] = useState({
        id: courseDetails?._id,
        lecture: undefined,
        title: "",
        description: "",
        videoSrc: "",
    });

    // --- Materials ---
    const [materials, setMaterials] = useState([]);
    const [materialFiles, setMaterialFiles] = useState([]);

    // --- Quiz ---
    const [quiz, setQuiz] = useState({
        title: "",
        passingScore: 70,
        questions: [],
    });

    function handleInputChange(e) {
        const { name, value } = e.target;
        setUserInput(prev => ({ ...prev, [name]: value }));
    }

    function handleVideo(e) {
        const video = e.target.files[0];
        if (!video) return;
        const source = window.URL.createObjectURL(video);
        setUserInput(prev => ({ ...prev, lecture: video, videoSrc: source }));
    }

    // ===================== MATERIALS =====================

    function addMaterial(type) {
        setMaterials(prev => [
            ...prev,
            { type, title: "", content: "", url: "", fileRef: null },
        ]);
    }

    function updateMaterial(idx, field, value) {
        setMaterials(prev => {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], [field]: value };
            return copy;
        });
    }

    function removeMaterial(idx) {
        setMaterials(prev => prev.filter((_, i) => i !== idx));
        // Rebuild materialFiles to match new indexes
        setMaterialFiles(prev => {
            const matCopy = materials.filter((_, i) => i !== idx);
            return prev.filter((_, fi) => {
                // Keep files that still have a corresponding file material
                const fileMats = matCopy.filter(m => m.type === 'file');
                return fi < fileMats.length;
            });
        });
    }

    function handleMaterialFile(idx, e) {
        const file = e.target.files[0];
        if (!file) return;
        updateMaterial(idx, 'fileRef', file.name);
        // Track file in array at position = number of file-type materials before this index
        const filePos = materials.slice(0, idx).filter(m => m.type === 'file').length;
        setMaterialFiles(prev => {
            const copy = [...prev];
            copy[filePos] = file;
            return copy;
        });
    }

    // ===================== QUIZ =====================

    function addQuestion() {
        setQuiz(prev => ({
            ...prev,
            questions: [...prev.questions, emptyQuestion()],
        }));
    }

    function removeQuestion(qi) {
        setQuiz(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== qi),
        }));
    }

    function updateQuestion(qi, field, value) {
        setQuiz(prev => {
            const qs = [...prev.questions];
            qs[qi] = { ...qs[qi], [field]: value };
            return { ...prev, questions: qs };
        });
    }

    function updateOption(qi, oi, value) {
        setQuiz(prev => {
            const qs = [...prev.questions];
            const opts = [...qs[qi].options];
            opts[oi] = value;
            qs[qi] = { ...qs[qi], options: opts };
            return { ...prev, questions: qs };
        });
    }

    function addOption(qi) {
        setQuiz(prev => {
            const qs = [...prev.questions];
            qs[qi] = { ...qs[qi], options: [...qs[qi].options, ""] };
            return { ...prev, questions: qs };
        });
    }

    function removeOption(qi, oi) {
        setQuiz(prev => {
            const qs = [...prev.questions];
            const opts = qs[qi].options.filter((_, i) => i !== oi);
            const correctIndex = qs[qi].correctIndex >= opts.length ? 0 : qs[qi].correctIndex;
            qs[qi] = { ...qs[qi], options: opts, correctIndex };
            return { ...prev, questions: qs };
        });
    }

    // ===================== SUBMIT =====================

    async function onFormSubmit(e) {
        e.preventDefault();

        if (!userInput.title || !userInput.description) {
            toast.error("Название и описание обязательны");
            return;
        }

        // Validate quiz if there are questions
        if (quiz.questions.length > 0) {
            for (let i = 0; i < quiz.questions.length; i++) {
                const q = quiz.questions[i];
                if (!q.text.trim()) {
                    toast.error(`Вопрос ${i + 1}: введите текст вопроса`);
                    return;
                }
                if (q.options.filter(o => o.trim()).length < 2) {
                    toast.error(`Вопрос ${i + 1}: минимум 2 варианта ответа`);
                    return;
                }
            }
        }

        const formData = new FormData();
        formData.append("id", userInput.id);
        formData.append("title", userInput.title);
        formData.append("description", userInput.description);

        if (userInput.lecture) {
            formData.append("lecture", userInput.lecture);
        }

        // Materials JSON (без файлов)
        const materialsPayload = materials.map(m => {
            const { fileRef, ...rest } = m;
            return rest;
        });
        if (materialsPayload.length > 0) {
            formData.append("materials", JSON.stringify(materialsPayload));
        }

        // Material files
        materialFiles.forEach(f => {
            if (f) formData.append("materialFiles", f);
        });

        // Quiz
        if (quiz.questions.length > 0) {
            const quizPayload = {
                title: quiz.title || "Тест",
                passingScore: Number(quiz.passingScore),
                questions: quiz.questions.map(q => ({
                    ...q,
                    options: q.options.filter(o => o.trim()),
                })),
            };
            formData.append("quiz", JSON.stringify(quizPayload));
        }

        const response = await dispatch(addCourseLectures(formData));
        if (response?.payload?.success) {
            navigate(-1);
        }
    }

    useEffect(() => {
        if (!courseDetails) navigate("/courses");
    }, []);

    const tabs = [
        { id: "main", label: "Основное" },
        { id: "materials", label: `Материалы ${materials.length > 0 ? `(${materials.length})` : ""}` },
        { id: "quiz", label: `Тест ${quiz.questions.length > 0 ? `(${quiz.questions.length})` : ""}` },
    ];

    return (
        <HomeLayout>
            <div className="min-h-[90vh] bg-gradient-to-br from-white to-primary-50 flex flex-col items-center py-10 px-4 gap-6">
                <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-primary-100 overflow-hidden">

                    {/* Header */}
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-primary-100">
                        <button
                            onClick={() => navigate(-1)}
                            className="text-2xl text-primary-600 hover:text-primary-700"
                        >
                            <AiOutlineArrowLeft />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900">Добавить лекцию</h1>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-primary-100">
                        {tabs.map(t => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === t.id
                                    ? "border-b-2 border-primary-600 text-primary-600"
                                    : "text-gray-500 hover:text-primary-500"
                                    }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={onFormSubmit} className="p-6 flex flex-col gap-5">

                        {/* ========== TAB: MAIN ========== */}
                        {activeTab === "main" && (
                            <>
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-semibold text-gray-700">Название лекции *</label>
                                    <input
                                        type="text"
                                        name="title"
                                        placeholder="Введите название"
                                        value={userInput.title}
                                        onChange={handleInputChange}
                                        className="border border-gray-300 focus:border-primary-500 focus:outline-none px-3 py-2 rounded-lg text-gray-900 transition-colors"
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-semibold text-gray-700">Описание лекции *</label>
                                    <textarea
                                        name="description"
                                        placeholder="Введите описание"
                                        value={userInput.description}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="border border-gray-300 focus:border-primary-500 focus:outline-none px-3 py-2 rounded-lg text-gray-900 resize-none transition-colors"
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-semibold text-gray-700">
                                        Видео <span className="text-gray-400 font-normal">(необязательно)</span>
                                    </label>
                                    {userInput.videoSrc ? (
                                        <div className="space-y-2">
                                            <video
                                                muted src={userInput.videoSrc} controls
                                                controlsList="nodownload nofullscreen"
                                                disablePictureInPicture
                                                className="rounded-xl w-full border border-primary-200 max-h-52"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setUserInput(p => ({ ...p, lecture: undefined, videoSrc: "" }))}
                                                className="text-sm text-red-500 hover:text-red-700"
                                            >
                                                Удалить видео
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="h-32 rounded-xl border-2 border-dashed border-primary-300 bg-primary-50 flex items-center justify-center cursor-pointer hover:bg-primary-100 transition-colors text-primary-600 font-semibold text-sm">
                                            Выбрать видео (.mp4, .webm, .mov…)
                                            <input
                                                type="file" className="hidden" name="lectureFile"
                                                accept="video/*"
                                                onChange={handleVideo}
                                            />
                                        </label>
                                    )}
                                </div>
                            </>
                        )}

                        {/* ========== TAB: MATERIALS ========== */}
                        {activeTab === "materials" && (
                            <>
                                <div className="flex gap-2 flex-wrap">
                                    <button type="button" onClick={() => addMaterial('text')}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-primary-50 border border-primary-300 text-primary-700 rounded-lg text-sm font-semibold hover:bg-primary-100">
                                        <AiOutlinePlus /> Текст
                                    </button>
                                    <button type="button" onClick={() => addMaterial('link')}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-primary-50 border border-primary-300 text-primary-700 rounded-lg text-sm font-semibold hover:bg-primary-100">
                                        <AiOutlinePlus /> Ссылка
                                    </button>
                                    <button type="button" onClick={() => addMaterial('file')}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-primary-50 border border-primary-300 text-primary-700 rounded-lg text-sm font-semibold hover:bg-primary-100">
                                        <AiOutlinePlus /> Файл
                                    </button>
                                </div>

                                {materials.length === 0 && (
                                    <p className="text-sm text-gray-400 text-center py-4">
                                        Нажмите «+ Текст», «+ Ссылка» или «+ Файл» чтобы добавить материал
                                    </p>
                                )}

                                <div className="flex flex-col gap-4">
                                    {materials.map((mat, idx) => (
                                        <div key={idx} className="border border-gray-200 rounded-xl p-4 flex flex-col gap-2 relative">
                                            <div className="flex items-center justify-between">
                                                <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${mat.type === 'text' ? 'bg-blue-100 text-blue-700' : mat.type === 'link' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                    {mat.type === 'text' ? 'Текст' : mat.type === 'link' ? 'Ссылка' : 'Файл'}
                                                </span>
                                                <button type="button" onClick={() => removeMaterial(idx)}
                                                    className="text-red-400 hover:text-red-600 text-lg">
                                                    <AiOutlineDelete />
                                                </button>
                                            </div>

                                            <input
                                                type="text"
                                                placeholder="Заголовок материала"
                                                value={mat.title}
                                                onChange={e => updateMaterial(idx, 'title', e.target.value)}
                                                className="border border-gray-300 focus:border-primary-500 focus:outline-none px-3 py-1.5 rounded-lg text-sm text-gray-900"
                                            />

                                            {mat.type === 'text' && (
                                                <textarea
                                                    placeholder="Текст / конспект / документация..."
                                                    value={mat.content}
                                                    onChange={e => updateMaterial(idx, 'content', e.target.value)}
                                                    rows={4}
                                                    className="border border-gray-300 focus:border-primary-500 focus:outline-none px-3 py-1.5 rounded-lg text-sm text-gray-900 resize-none"
                                                />
                                            )}

                                            {mat.type === 'link' && (
                                                <input
                                                    type="url"
                                                    placeholder="https://..."
                                                    value={mat.url}
                                                    onChange={e => updateMaterial(idx, 'url', e.target.value)}
                                                    className="border border-gray-300 focus:border-primary-500 focus:outline-none px-3 py-1.5 rounded-lg text-sm text-gray-900"
                                                />
                                            )}

                                            {mat.type === 'file' && (
                                                <label className="flex items-center gap-2 cursor-pointer text-sm text-primary-600 hover:text-primary-800">
                                                    <span className="border border-primary-300 rounded-lg px-3 py-1.5 hover:bg-primary-50">
                                                        {mat.fileRef ? `✓ ${mat.fileRef}` : "Выбрать файл (PDF, DOC…)"}
                                                    </span>
                                                    <input type="file" className="hidden"
                                                        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                                                        onChange={e => handleMaterialFile(idx, e)} />
                                                </label>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* ========== TAB: QUIZ ========== */}
                        {activeTab === "quiz" && (
                            <>
                                <div className="flex flex-col gap-3">
                                    <div className="flex gap-3">
                                        <div className="flex-1 flex flex-col gap-1">
                                            <label className="text-sm font-semibold text-gray-700">Название теста</label>
                                            <input
                                                type="text"
                                                placeholder="Проверка знаний"
                                                value={quiz.title}
                                                onChange={e => setQuiz(p => ({ ...p, title: e.target.value }))}
                                                className="border border-gray-300 focus:border-primary-500 focus:outline-none px-3 py-2 rounded-lg text-sm text-gray-900"
                                            />
                                        </div>
                                        <div className="w-32 flex flex-col gap-1">
                                            <label className="text-sm font-semibold text-gray-700">Проходной балл %</label>
                                            <input
                                                type="number" min="1" max="100"
                                                value={quiz.passingScore}
                                                onChange={e => setQuiz(p => ({ ...p, passingScore: e.target.value }))}
                                                className="border border-gray-300 focus:border-primary-500 focus:outline-none px-3 py-2 rounded-lg text-sm text-gray-900"
                                            />
                                        </div>
                                    </div>

                                    {quiz.questions.length === 0 && (
                                        <p className="text-sm text-gray-400 text-center py-4">
                                            Нажмите «+ Добавить вопрос» для создания теста
                                        </p>
                                    )}

                                    {quiz.questions.map((q, qi) => (
                                        <div key={qi} className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-gray-700">Вопрос {qi + 1}</span>
                                                <button type="button" onClick={() => removeQuestion(qi)}
                                                    className="text-red-400 hover:text-red-600 text-lg">
                                                    <AiOutlineDelete />
                                                </button>
                                            </div>

                                            <input
                                                type="text"
                                                placeholder="Текст вопроса"
                                                value={q.text}
                                                onChange={e => updateQuestion(qi, 'text', e.target.value)}
                                                className="border border-gray-300 focus:border-primary-500 focus:outline-none px-3 py-2 rounded-lg text-sm text-gray-900"
                                            />

                                            <div className="flex flex-col gap-2">
                                                <p className="text-xs text-gray-500 font-semibold">Варианты ответа (выберите правильный)</p>
                                                {q.options.map((opt, oi) => (
                                                    <div key={oi} className="flex items-center gap-2">
                                                        <input
                                                            type="radio"
                                                            name={`correct-${qi}`}
                                                            checked={q.correctIndex === oi}
                                                            onChange={() => updateQuestion(qi, 'correctIndex', oi)}
                                                            className="accent-primary-600 w-4 h-4 flex-shrink-0"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder={`Вариант ${oi + 1}`}
                                                            value={opt}
                                                            onChange={e => updateOption(qi, oi, e.target.value)}
                                                            className="flex-1 border border-gray-300 focus:border-primary-500 focus:outline-none px-3 py-1.5 rounded-lg text-sm text-gray-900"
                                                        />
                                                        {q.options.length > 2 && (
                                                            <button type="button" onClick={() => removeOption(qi, oi)}
                                                                className="text-gray-400 hover:text-red-500 text-base flex-shrink-0">
                                                                <AiOutlineDelete />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                {q.options.length < 6 && (
                                                    <button type="button" onClick={() => addOption(qi)}
                                                        className="text-xs text-primary-600 hover:text-primary-800 flex items-center gap-1 self-start">
                                                        <AiOutlinePlus /> добавить вариант
                                                    </button>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs font-semibold text-gray-500">Пояснение к ответу (необязательно)</label>
                                                <input
                                                    type="text"
                                                    placeholder="Отображается после ответа..."
                                                    value={q.explanation}
                                                    onChange={e => updateQuestion(qi, 'explanation', e.target.value)}
                                                    className="border border-gray-200 focus:border-primary-400 focus:outline-none px-3 py-1.5 rounded-lg text-sm text-gray-700"
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    <button type="button" onClick={addQuestion}
                                        className="flex items-center gap-1 self-start px-4 py-2 border-2 border-dashed border-primary-300 text-primary-600 hover:bg-primary-50 rounded-xl text-sm font-semibold transition-colors">
                                        <AiOutlinePlus /> Добавить вопрос
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 font-semibold text-lg rounded-lg transition-all duration-300 shadow-md mt-2"
                        >
                            Сохранить лекцию
                        </button>
                    </form>
                </div>
            </div>
        </HomeLayout>
    );
}

export default AddCourseLectures;
