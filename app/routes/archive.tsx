import { LoaderFunction, ActionFunction, redirect, useLoaderData } from "remix";
import { requireUserId } from "~/utils/session.server";
import { prisma } from "~/utils/db.server";
import { Book } from ".prisma/client";
import { groupArchivedBooksByMonth } from "~/utils/archive";
import { differenceInCalendarDays, format } from "date-fns";
import { getStatusDetails } from "~/utils/book";
import { ArrowCircleLeftIcon } from "@heroicons/react/solid";
import BackToNowReading from "~/components/BackToNowReading";

type LoaderData = {
    groupedArchivedBooks: Record<string, Book[]>;
};

export const loader: LoaderFunction = async ({ request }) => {
    const userId = await requireUserId(request, new URL(request.url).pathname);

    let archivedBooksList = await prisma.book.findMany({
        where: { readerId: userId, archivedAt: { not: null } },
        orderBy: { archivedAt: "desc" },
    });

    if (!archivedBooksList) {
        throw new Error("There was a problem getting archived books");
    }

    const groupedArchivedBooks = groupArchivedBooksByMonth(archivedBooksList);

    return { groupedArchivedBooks };
};

export const action: ActionFunction = async ({ request }) => {
    await requireUserId(request, new URL(request.url).pathname);
    const form = await request.formData();
    const bookId = form.get("bookId");

    if (typeof bookId !== "string" || !bookId) {
        throw new Error("Must have a bookId that is a string");
    }

    const updatedBook = await prisma.book.update({
        where: { id: bookId },
        data: {
            archivedAt: null,
        },
    });

    if (!updatedBook || updatedBook.archivedAt) {
        throw new Error("There was a problem un-archiving this book");
    }

    return redirect("/now-reading");
};

export default function Archive() {
    const data = useLoaderData<LoaderData | undefined>();

    return (
        <div>
            <BackToNowReading />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-200">Archived Books</h2>
            <div className="my-4">
                {data?.groupedArchivedBooks ? (
                    Object.keys(data.groupedArchivedBooks).map((month) => (
                        <div>
                            <div className="flex justify-between items-baseline mb-2">
                                <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-100">{month}</h3>
                                <p className="text-gray-500 font-bold dark:text-gray-400">
                                    {data.groupedArchivedBooks[month].length}{" "}
                                    {data.groupedArchivedBooks[month].length === 1 ? "book" : "books"}
                                </p>
                            </div>
                            {data.groupedArchivedBooks[month].map((book) => (
                                <div className="bg-gray-100 dark:bg-gray-800 rounded-3xl p-8 flex gap-8 items-center justify-between">
                                    <div className="flex gap-6 items-center">
                                        <figure className="flex flex-col rounded-lg overflow-hidden w-16 shadow-md justify-center items-center bg-white dark:bg-gray-700 ">
                                            <span
                                                className={`${
                                                    book.completedAt ? "bg-blue-500" : "bg-gray-400"
                                                } text-white font-bold w-full text-center`}
                                            >
                                                {format(new Date(book.archivedAt!), "MMM").toUpperCase()}
                                            </span>
                                            <span className="text-3xl font-bold pb-1">
                                                {format(new Date(book.archivedAt!), "d")}
                                            </span>
                                        </figure>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                                                {book.title}
                                            </h2>
                                            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                                                {book.author}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
                                                {book.completedAt
                                                    ? `Read in ${
                                                          differenceInCalendarDays(
                                                              new Date(book.completedAt),
                                                              new Date(),
                                                          ) + 1
                                                      } days`
                                                    : "Not completed"}
                                            </p>
                                        </div>
                                    </div>
                                    <form method="post">
                                        <input type="hidden" name="bookId" value={book.id} />
                                        <button type="submit" aria-label={`Un-archive ${book.title}`}>
                                            <ArrowCircleLeftIcon className="w-8 h-8 text-blue-500" />
                                        </button>
                                    </form>
                                </div>
                            ))}
                        </div>
                    ))
                ) : (
                    <p>No archived books</p>
                )}
            </div>
        </div>
    );
}
