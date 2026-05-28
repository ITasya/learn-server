import {BsFacebook, BsInstagram, BsLinkedin, BsTwitter} from 'react-icons/bs';

function Footer(){
    const currentDate = new Date();
    const year = currentDate.getFullYear();

    return(
        <footer className="relative left-0 bottom-0 bg-gray-900 text-white sm:h-[10vh] h-[15vh] py-5 sm:px-20 sm:pb-2 flex flex-col sm:flex-row items-center justify-between">
            <section className="text-gray-300 text-sm">
                © {year} LearnHub — корпоративная платформа обучения. Все права защищены.
            </section>
            <section className="flex items-center justify-center gap-5 text-2xl text-gray-300">
                <a className="hover:text-primary-400 transition-all ease-in-out duration-300"><BsFacebook /></a>
                <a className="hover:text-primary-400 transition-all ease-in-out duration-300"><BsInstagram /></a>
                <a className="hover:text-primary-400 transition-all ease-in-out duration-300"><BsLinkedin /></a>
                <a className="hover:text-primary-400 transition-all ease-in-out duration-300"><BsTwitter /></a>
            </section>
        </footer>
    )
}
export default Footer;
