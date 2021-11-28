import { Link } from "remix";
import { ChevronLeftIcon } from "@heroicons/react/solid";

export default function BackToNowReading() {
    return (
        <Link
            to="/now-reading"
            className="text-blue-500 flex items-center font-semibold relative -left-1.5 max-w-max mb-4"
        >
            <ChevronLeftIcon className="w-5 h-5 relative" style={{ top: "1px" }} /> Now Reading
        </Link>
    );
}
