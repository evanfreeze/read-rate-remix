import { Book, DailyTarget } from ".prisma/client";
import { Outlet, Link, LoaderFunction, useLoaderData } from "remix";
import { prisma } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";
import { differenceInCalendarDays, isToday } from "date-fns";
import { BookOpenIcon } from "@heroicons/react/outline";
import { ArchiveIcon } from "@heroicons/react/outline";
import CircleProgress from "~/components/CircleProgress";
import { createNewDailyTarget, getStatusDetails, shouldUpdateDailyTarget } from "~/utils/book";

export interface BookWithTarget extends Book {
    dailyTargets: DailyTarget[];
}

type LoaderData = {
    books: BookWithTarget[];
};

export const loader: LoaderFunction = async ({ request }) => {
    const userId = await requireUserId(request, "/now-reading");
    const books = await prisma.book.findMany({
        where: { readerId: userId },
        include: {
            dailyTargets: {
                take: 1,
                orderBy: {
                    calcTime: "desc",
                },
            },
        },
    });

    for (let i = 0; i < books.length; i += 1) {
        const book = books[i];

        if (shouldUpdateDailyTarget(book)) {
            const newTarget = await createNewDailyTarget(book);
            book.dailyTargets = [newTarget];
        }
    }

    return { books };
};

export default function NowReading() {
    const data = useLoaderData<LoaderData | undefined>();

    return (
        <main>
            <h2 className="text-3xl font-bold text-gray-900">Now Reading</h2>
            <div className="flex flex-col gap-4 my-4">
                {data?.books?.length ?? 0 > 0 ? (
                    data?.books.map((book) => <BookRow key={book.id} book={book} />)
                ) : (
                    <>
                        <p>You haven't started any books yet</p>
                    </>
                )}
            </div>
            <div>
                <Outlet />
            </div>
            <div className="flex justify-center gap-3 mt-10">
                <button className="bg-gray-100 hover:bg-gray-200 p-3 flex gap-1.5 items-center justify-center rounded-xl transition-all duration-150 text-gray-700 hover:text-black font-bold">
                    <ArchiveIcon className="w-5 h-5 text-blue-500" />
                    <Link to="/archive">Archived Books</Link>
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 p-3 flex gap-1.5 items-center justify-center rounded-xl transition-all duration-150 text-gray-700 hover:text-black font-bold">
                    <BookOpenIcon className="w-5 h-5 text-blue-500" />
                    <Link to="new">Add Book</Link>
                </button>
            </div>
        </main>
    );
}

export function BookRow({ book }: { book: BookWithTarget }) {
    const percentComplete = book.currentPage / book.pageCount;
    const targetPage = book.dailyTargets[0].targetPage;
    const pagesRemaining = Math.max(0, targetPage - book.currentPage);

    return (
        <Link to={`${book.id}`} className="bg-gray-100 rounded-3xl p-7 flex gap-7 items-center">
            <figure className="w-20 h-20">
                <CircleProgress color={getStatusDetails(book)[1]} progress={percentComplete}>
                    {getStatusDetails(book)[2]}
                </CircleProgress>
            </figure>
            <div>
                <h2 className="text-2xl font-bold text-gray-800">{book.title}</h2>
                <h3 className="text-lg font-semibold text-gray-600">{book.author}</h3>
                <p className="text-sm text-gray-500 mt-1.5">{getStatusDetails(book)[0]}</p>
            </div>
        </Link>
    );
}
