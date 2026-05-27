import { useState } from "react";
import toast from "react-hot-toast";

import axiosInstance from "../Helpers/axiosinstance";
import { isEmail } from "../Helpers/regexMatcher";
import HomeLayout from "../Layouts/HomeLayout";

function Contact(){

    const [userInput, setUserInput] = useState({
        name: "",
        email: "",
        message: "",
    })

    function handleInputChange(e){
        const {name, value} = e.target;
        setUserInput({
            ...userInput,
            [name]: value
        })
    }

    async function onFormSubmit(e){
        e.preventDefault();
        if(!userInput.email || !userInput.name || !userInput.message){
            toast.error("Все поля обязательны для заполнения");
            return;
        }
        if(!isEmail(userInput.email)){
            toast.error("Некорректный адрес электронной почты");
            return;
        }
        try {
            const response = axiosInstance.post("/contact", userInput)
            toast.promise(response, {
                loading: "Отправляем ваше сообщение...",
                success: "Сообщение успешно отправлено",
                error: "Не удалось отправить сообщение"
            })
            const contactResponse = await response;
            if(contactResponse?.data?.success){
                setUserInput({ name: "", email: "", message: "" })
            }
        } catch (error) {
            toast.error("Операция не выполнена...")
        }
    }

    return (
        <HomeLayout>
            <div className="flex items-center justify-center min-h-[90vh] bg-gradient-to-br from-white to-primary-50">
                <form
                    noValidate
                    onSubmit={onFormSubmit}
                    className="flex flex-col items-center justify-center gap-4 p-8 rounded-2xl bg-white shadow-lg border border-primary-100 sm:w-[26rem] w-[90vw]"
                >
                    <h1 className="text-3xl font-bold text-gray-900">
                        Обратная связь
                    </h1>
                    <p className="text-gray-500 text-sm text-center">Напишите нам — мы ответим в ближайшее время</p>

                    <div className="flex flex-col w-full gap-1">
                        <label htmlFor="name" className="text-sm font-semibold text-gray-700">Имя</label>
                        <input
                            className="border border-gray-300 focus:border-primary-500 focus:outline-none px-3 py-2 rounded-lg text-gray-900 bg-white transition-colors"
                            type="text"
                            name="name"
                            id="name"
                            placeholder="Введите ваше имя"
                            onChange={handleInputChange}
                            value={userInput.name}
                        />
                    </div>

                    <div className="flex flex-col w-full gap-1">
                        <label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</label>
                        <input
                            className="border border-gray-300 focus:border-primary-500 focus:outline-none px-3 py-2 rounded-lg text-gray-900 bg-white transition-colors"
                            type="email"
                            name="email"
                            id="email"
                            placeholder="Введите ваш email"
                            onChange={handleInputChange}
                            value={userInput.email}
                        />
                    </div>

                    <div className="flex flex-col w-full gap-1">
                        <label htmlFor="message" className="text-sm font-semibold text-gray-700">Сообщение</label>
                        <textarea
                            className="border border-gray-300 focus:border-primary-500 focus:outline-none px-3 py-2 rounded-lg resize-none h-36 text-gray-900 bg-white transition-colors"
                            name="message"
                            id="message"
                            placeholder="Введите ваше сообщение"
                            onChange={handleInputChange}
                            value={userInput.message}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white transition-all ease-in-out duration-300 rounded-lg py-2.5 font-semibold text-lg cursor-pointer shadow-md"
                    >
                        Отправить
                    </button>
                </form>
            </div>
        </HomeLayout>
    )
}
export default Contact;
