import { useEffect } from "react";
import toast from "react-hot-toast";
import { BiRupee } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import HomeLayout from '../../Layouts/HomeLayout';
import { getRazorPayId, purchaseCourseBundle, verifyUserPayment } from "../../Redux/Slices/RazorpaySlice.js";

function Checkout() {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const razorpayKey = useSelector((state) => state?.razorpay?.key);
    const subscription_id = useSelector((state) => state?.razorpay?.subscription_id);
    const paymentDetails = {
        razorpay_payment_id: "",
        razorpay_subscription_id: "",
        razorpay_signature: ""
    }

    async function handleSubscription(e) {
        e.preventDefault();
        if(!razorpayKey || !subscription_id) {
            toast.error("Что-то пошло не так");
            return;
        }
        const options = {
            key: razorpayKey,
            subscription_id: subscription_id,
            name: "LearnHub",
            description: "Подписка",
            theme: { color: '#7c3aed' },
            handler: async function (response) {
                paymentDetails.razorpay_payment_id = response.razorpay_payment_id;
                paymentDetails.razorpay_signature = response.razorpay_signature;
                paymentDetails.razorpay_subscription_id = response.razorpay_subscription_id;
                toast.success("Оплата прошла успешно");
                const res = await dispatch(verifyUserPayment(paymentDetails));
                res?.payload?.success ? navigate("/checkout/success") : navigate("/checkout/fail");
            }
        }
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
    }

    async function load() {
        await dispatch(getRazorPayId());
        await dispatch(purchaseCourseBundle());
    }

    useEffect(() => {
        load();
    }, []);

    return (
        <HomeLayout>
            <form
                onSubmit={handleSubscription}
                className="min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-white to-primary-50"
            >
                <div className="w-80 flex flex-col bg-white rounded-2xl shadow-lg border border-primary-100 overflow-hidden">
                    <div className="bg-primary-600 py-4 text-center">
                        <h1 className="text-2xl font-bold text-white">Подписка</h1>
                    </div>

                    <div className="px-6 py-6 space-y-5 text-center">
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Эта подписка откроет вам доступ ко всем курсам платформы на{" "}
                            <span className="text-primary-600 font-bold">1 год</span>.
                            Все существующие и новые курсы будут доступны сразу.
                        </p>

                        <p className="flex items-center justify-center gap-1 text-3xl font-bold text-primary-700">
                            <BiRupee /><span>499</span>
                            <span className="text-base font-normal text-gray-500 ml-1">₽/год</span>
                        </p>

                        <div className="text-gray-400 text-xs space-y-1 bg-primary-50 rounded-xl p-3">
                            <p>100% возврат при отмене</p>
                            <p>* Применяются условия *</p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="bg-primary-600 hover:bg-primary-700 text-white text-lg font-bold py-3 transition-all ease-in-out duration-300"
                    >
                        Оплатить
                    </button>
                </div>
            </form>
        </HomeLayout>
    );
}

export default Checkout;
