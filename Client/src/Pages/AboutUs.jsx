import aboutMainImage from "../Assets/Images/aboutMainImage.jpeg";
import CarouselSlide from "../Compontents/CarouselSlide";
import { celebrities } from "../Constants/CelebrityData";
import HomeLayout from "../Layouts/HomeLayout";

function AboutUs(){
    return (
        <HomeLayout>
            <div className="lg:pl-20 pt-20 flex flex-col bg-white min-h-[90vh]">
                <div className="flex flex-col lg:flex-row items-center gap-5 mx-10">
                    <section className="lg:w-1/2 space-y-8">
                        <h1 className="text-4xl sm:text-5xl text-primary-700 font-bold leading-tight">
                            Доступное и качественное образование
                        </h1>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Наша цель — предоставить доступное качественное образование всему миру. Мы создаём платформу для начинающих преподавателей и студентов, чтобы делиться навыками, творчеством и знаниями друг с другом — для роста и развития каждого.
                        </p>
                    </section>
                    <div className="lg:w-1/2">
                        <img
                            id="test1"
                            alt="о нас"
                            className="w-full max-w-md mx-auto rounded-2xl object-cover"
                            src={aboutMainImage}
                        />
                    </div>
                </div>

                <div className="w-[80vw] carousel lg:w-1/2 m-auto my-16 bg-primary-50 rounded-2xl p-6">
                    {celebrities && celebrities.map(celebrity => (
                        <CarouselSlide
                            {...celebrity}
                            key={celebrity.slideNumber}
                            totalSlides={celebrities.length}
                        />
                    ))}
                </div>
            </div>
        </HomeLayout>
    )
}
export default AboutUs;
