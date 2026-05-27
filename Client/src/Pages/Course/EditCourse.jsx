import { useState } from "react";
import toast from "react-hot-toast";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";

import HomeLayout from "../../Layouts/HomeLayout";
import { updateCourse } from "../../Redux/Slices/CourseSlice";

function EditCourse(){

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {state} = useLocation();

    const [userInput, setUserInput] = useState({
        id: state?._id,
        title: state?.title,
        category: state?.category,
        description: state?.description,
        createdBy: state?.createdBy,
        thumbnail: null,
        previewImage: state.thumbnail?.secure_url,
    });

    function handleImageUpload(e){
        e.preventDefault();
        const uploadedImage = e.target.files[0];
        if(uploadedImage){
            const fileReader = new FileReader();
            fileReader.readAsDataURL(uploadedImage);
            fileReader.addEventListener("load", function(){
                setUserInput({ ...userInput, previewImage: this.result, thumbnail: uploadedImage })
            })
        }
    }

    function handleUserInput(e){
        e.preventDefault();
        const {name, value} = e.target;
        setUserInput({ ...userInput, [name]: value })
    }

    async function OnFormSubmit(e){
        e.preventDefault();
        if(!userInput.title || !userInput.description || !userInput.category){
            toast.error("Все поля обязательны для заполнения");
            return;
        }
        const response = await dispatch(updateCourse(userInput));
        if(response?.payload?.success){
            setUserInput({ title: "", category: "", description: "", thumbnail: null });
            navigate("/courses");
        }
    }

    return(
        <HomeLayout>
            <div className="flex items-center justify-center min-h-[100vh] bg-gradient-to-br from-white to-primary-50 py-10">
                <form
                    onSubmit={OnFormSubmit}
                    className="flex flex-col justify-center gap-5 rounded-2xl p-8 bg-white text-gray-900 w-[90vw] md:w-[700px] shadow-lg border border-primary-100 relative"
                >
                    <div>
                        <Link to={"/"} className="absolute left-4 top-4 text-xl text-primary-600 hover:text-primary-700 cursor-pointer">
                            <AiOutlineArrowLeft />
                        </Link>
                    </div>

                    <h1 className="text-center text-2xl font-bold text-gray-900">
                        Редактировать курс
                    </h1>

                    <main className="grid lg:grid-cols-2 grid-cols-1 gap-x-8 gap-y-4">
                        <div className="flex flex-col gap-4">
                            <div>
                                <label htmlFor="image_uploads" className="cursor-pointer block">
                                    {userInput.previewImage ? (
                                        <img
                                            className="w-full h-44 object-cover rounded-xl border-2 border-primary-200"
                                            src={userInput.previewImage}
                                            alt="обложка курса"
                                        />
                                    ) : (
                                        <div className="w-full h-44 rounded-xl border-2 border-dashed border-primary-300 bg-primary-50 flex flex-col items-center justify-center gap-2 hover:bg-primary-100 transition-colors">
                                            <p className="font-semibold text-primary-600">Загрузить обложку</p>
                                            <p className="text-xs text-gray-400">JPG, JPEG, PNG</p>
                                        </div>
                                    )}
                                </label>
                                <input
                                    className="hidden"
                                    type="file"
                                    id="image_uploads"
                                    accept=".jpg, .jpeg, .png"
                                    name="image_uploads"
                                    onChange={handleImageUpload}
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-semibold text-gray-700" htmlFor="title">
                                    Название курса
                                </label>
                                <input
                                    required
                                    type="text"
                                    name="title"
                                    id="title"
                                    placeholder="Введите название курса"
                                    className="border border-gray-300 focus:border-primary-500 focus:outline-none px-3 py-2 rounded-lg bg-white text-gray-900 transition-colors"
                                    value={userInput.title}
                                    onChange={handleUserInput}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-semibold text-gray-700" htmlFor="createdBy">
                                    Преподаватель
                                </label>
                                <input
                                    required
                                    type="text"
                                    name="createdBy"
                                    id="createdBy"
                                    placeholder="Введите имя преподавателя"
                                    className="border border-gray-300 focus:border-primary-500 focus:outline-none px-3 py-2 rounded-lg bg-white text-gray-900 transition-colors"
                                    value={userInput.createdBy}
                                    onChange={handleUserInput}
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-semibold text-gray-700" htmlFor="category">
                                    Категория
                                </label>
                                <input
                                    required
                                    type="text"
                                    name="category"
                                    id="category"
                                    placeholder="Введите категорию"
                                    className="border border-gray-300 focus:border-primary-500 focus:outline-none px-3 py-2 rounded-lg bg-white text-gray-900 transition-colors"
                                    value={userInput.category}
                                    onChange={handleUserInput}
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-semibold text-gray-700" htmlFor="description">
                                    Описание курса
                                </label>
                                <textarea
                                    required
                                    name="description"
                                    id="description"
                                    placeholder="Введите описание курса"
                                    className="border border-gray-300 focus:border-primary-500 focus:outline-none px-3 py-2 rounded-lg h-28 resize-none bg-white text-gray-900 transition-colors"
                                    value={userInput.description}
                                    onChange={handleUserInput}
                                />
                            </div>
                        </div>
                    </main>

                    <button
                        type="submit"
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white text-lg transition-all duration-300 ease-in-out py-2.5 rounded-lg font-semibold shadow-md"
                    >
                        Сохранить изменения
                    </button>
                </form>
            </div>
        </HomeLayout>
    )
}
export default EditCourse;
