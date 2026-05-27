import { useState } from "react";
import toast from "react-hot-toast";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { BsPersonCircle } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import HomeLayout from "../../Layouts/HomeLayout";
import { getuserData, updateProfile } from "../../Redux/Slices/AuthSlice";

function EditProfile(){

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [data, setData] = useState({
        previewImage: "",
        fullName: "",
        avatar: undefined,
        userId: useSelector((state) => state?.auth?.data?._id)
    });

    function handleImageUpload(e){
        e.preventDefault();
        const uploadedImage = e.target.files[0];
        if(uploadedImage){
            const fileReader = new FileReader();
            fileReader.readAsDataURL(uploadedImage);
            fileReader.addEventListener("load", function(){
                setData({ ...data, previewImage: this.result, avatar: uploadedImage })
            })
        }
    }

    function handleInputChange(e){
        const {name, value} = e.target;
        setData({ ...data, [name]: value })
    }

    async function onFormSubmit(e){
        e.preventDefault();
        if(!data.fullName || !data.avatar){
            toast.error("Все поля обязательны для заполнения");
            return;
        }
        if(data.fullName.length < 5){
            toast.error("Имя должно содержать не менее 5 символов");
            return;
        }

        const fromData = new FormData();
        fromData.append("fullName", data.fullName);
        fromData.append("avatar", data.avatar);

        await dispatch(updateProfile(fromData));
        await dispatch(getuserData());
        navigate("/user/profile");
    }

    return (
        <HomeLayout>
            <div className="flex items-center justify-center min-h-[90vh] bg-gradient-to-br from-white to-primary-50">
                <form
                    onSubmit={onFormSubmit}
                    className="flex flex-col items-center justify-center gap-5 rounded-2xl p-8 bg-white text-gray-900 w-[90vw] sm:w-96 shadow-lg border border-primary-100"
                >
                    <h1 className="text-center text-2xl font-bold text-gray-900">Редактировать профиль</h1>

                    <label className="cursor-pointer" htmlFor="image_uploads">
                        {data.previewImage ? (
                            <img
                                className="w-28 h-28 rounded-full border-4 border-primary-200 object-cover shadow-md"
                                src={data.previewImage}
                                alt="аватар"
                            />
                        ) : (
                            <BsPersonCircle className="w-28 h-28 text-primary-300" />
                        )}
                    </label>
                    <input
                        onChange={handleImageUpload}
                        className="hidden"
                        type="file"
                        id="image_uploads"
                        name="image_uploads"
                        accept=".jpg, .png, .svg, .jpeg"
                    />
                    <p className="text-xs text-gray-500 -mt-3">Нажмите для изменения фото</p>

                    <div className="w-full flex flex-col gap-1">
                        <label htmlFor="fullName" className="text-sm font-semibold text-gray-700">Полное имя</label>
                        <input
                            type="text"
                            required
                            name="fullName"
                            id="fullName"
                            placeholder="Введите ваше полное имя"
                            className="border border-gray-300 focus:border-primary-500 focus:outline-none px-3 py-2 rounded-lg bg-white text-gray-900 transition-colors"
                            onChange={handleInputChange}
                            value={data.fullName}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 font-semibold text-lg cursor-pointer transition-all ease-in-out duration-300 rounded-lg shadow-md"
                    >
                        Сохранить изменения
                    </button>

                    <Link to="/user/profile">
                        <p className="text-primary-600 hover:text-primary-700 cursor-pointer flex items-center justify-center gap-2 text-sm">
                            <AiOutlineArrowLeft /> Вернуться в профиль
                        </p>
                    </Link>
                </form>
            </div>
        </HomeLayout>
    )
}
export default EditProfile;
