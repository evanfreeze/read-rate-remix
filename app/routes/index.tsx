import { Link } from "remix";

export default function LandingPage() {
    const landingCtaTailwindClasses =
        "text-normal font-bold text-center leading-none px-5 py-4 rounded-2xl cursor-pointer bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-300 hover:text-black dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700";

    return (
        <main className="flex flex-col justify-center items-center" style={{ marginTop: "20%" }}>
            <img src="/images/icon.png" alt="Read Rate iOS App Icon" width="150" height="150" />
            <h1 className="text-3xl font-bold m-0 leading-none mt-5 dark:text-gray-100">Read Rate</h1>
            <p className="opacity-50 m-2 text-lg dark:text-gray-300">Read more books</p>
            <div className="flex flex-col gap-3 m-8">
                <a className={landingCtaTailwindClasses} href="https://testflight.apple.com/join/ohOnY6yp">
                    Join the iOS Beta
                </a>
                <Link className={landingCtaTailwindClasses} to="/now-reading">
                    Use the Web Version
                </Link>
            </div>
        </main>
    );
}
