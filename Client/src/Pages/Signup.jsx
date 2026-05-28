import { useState } from "react";
import { toast } from 'react-hot-toast';
import { BsPersonCircle } from "react-icons/bs";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import { isEmail, isPassword } from "../Helpers/regexMatcher";
import HomeLayout from "../Layouts/HomeLayout";
import { creatAccount } from "../Redux/Slices/AuthSlice";

function Signup(){

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [prevImage, setPrevImage] = useState("");

    const [signupData, setSignupData] = useState({
        fullName: "",
        email: "",
        password: "",
        avatar: "",
    });

    function handleUserInput(e){
        const {name, value} = e.target;
        setSignupData({ ...signupData, [name]: value })
    }

    function getImage(event){
        event.preventDefault();
        const uploadedImage = event.target.files[0];
        if(uploadedImage){
            setSignupData({ ...signupData, avatar: uploadedImage });
            const fileReader = new FileReader();
            fileReader.readAsDataURL(uploadedImage);
            fileReader.addEventListener("load", function(){
                setPrevImage(this.result);
            })
        }
    }

    async function createNewAccount(event){
        event.preventDefault();
        if (!signupData.email || !signupData.fullName || !signupData.avatar || !signupData.password) {
            toast.error("Пожалуйста, заполните все поля");
            return;
        }
        if(signupData.fullName.length < 5){
            toast.error("Имя должно содержать не менее 5 символов");
            return;
        }
        if (!isEmail(signupData.email)) {
            toast.error("Некорректный адрес электронной почты");
            return;
        }
        if(!isPassword(signupData.password)){
            toast.error("Пароль должен содержать 6–16 символов, минимум одну цифру и один спецсимвол (. ! @ # $ % и др.)");
            return;
        }

        const formData = new FormData();
        formData.append("fullName", signupData.fullName);
        formData.append("email", signupData.email);
        formData.append("password", signupData.password);
        formData.append("avatar", signupData.avatar);

        const response = await dispatch(creatAccount(formData));
        if(response?.payload?.success){
            navigate("/");
            setSignupData({ fullName: "", email: "", password: "", avatar: "" })
            setPrevImage("");
        }
    }

    return(
        <HomeLayout>
            <div className="flex items-center justify-center min-h-[90vh] bg-gradient-to-br from-white to-primary-50 py-10">
                <form
                    noValidate
                    onSubmit={createNewAccount}
                    className="flex flex-col justify-center gap-4 rounded-2xl bg-white text-gray-900 p-8 w-[90vw] sm:w-96 shadow-lg border border-primary-100"
                >
                    <h1 className="text-center text-3xl font-bold text-gray-900">Регистрация</h1>

                    <label htmlFor="image_uploads" className="cursor-pointer flex justify-center">
                        {prevImage ? (
                            <img className="w-24 h-24 rounded-full border-4 border-primary-200 object-cover" src={prevImage} alt="аватар" />
                        ) : (
                            <BsPersonCircle className="w-24 h-24 text-primary-300" />
                        )}
                    </label>
                    <input
                        className="hidden"
                        type="file"
                        name="image_uploads"
                        id="image_uploads"
                        accept=".jpg, .jpeg, .png, .svg"
                        onChange={getImage}
                    />
                    <p className="text-center text-xs text-gray-500 -mt-2">Нажмите для загрузки фото</p>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="fullName" className="text-sm font-semibold text-gray-700">Полное имя</label>
                        <input
                            type="text"
                            required
                            name="fullName"
                            id="fullName"
                            placeholder="Введите ваше полное имя"
                            className="border border-gray-300 focus:border-primary-500 focus:outline-none px-3 py-2 rounded-lg bg-white text-gray-900 transition-colors"
                            onChange={handleUserInput}
                            value={signupData.fullName}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</label>
                        <input
                            type="email"
                            required
                            name="email"
                            id="email"
                            placeholder="Введите ваш email"
                            className="border border-gray-300 focus:border-primary-500 focus:outline-none px-3 py-2 rounded-lg bg-white text-gray-900 transition-colors"
                            onChange={handleUserInput}
                            value={signupData.email}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="password" className="text-sm font-semibold text-gray-700">Пароль</label>
                        <input
                            type="password"
                            required
                            name="password"
                            id="password"
                            placeholder="Введите ваш пароль"
                            className="border border-gray-300 focus:border-primary-500 focus:outline-none px-3 py-2 rounded-lg bg-white text-gray-900 transition-colors"
                            onChange={handleUserInput}
                            value={signupData.password}
                        />
                    </div>

                    <button
                        type="submit"
                        className="mt-1 bg-primary-600 hover:bg-primary-700 text-white py-2.5 font-semibold text-lg cursor-pointer transition-all ease-in-out duration-300 rounded-lg shadow-md"
                    >
                        Создать аккаунт
                    </button>
                    <p className="text-center text-gray-600 text-sm">
                        Уже есть аккаунт?{" "}
                        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold cursor-pointer">
                            Войти
                        </Link>
                    </p>
                </form>
            </div>
        </HomeLayout>
    )
}
export default Signup;
