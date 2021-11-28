import { LoaderFunction, useLoaderData, Outlet, Link } from "remix";
import { requireUserId } from "~/utils/session.server";
import { prisma } from "~/utils/db.server";
import CircleProgress from "~/components/CircleProgress";
import { getStatusDetails } from "~/utils/book";
import { formatDistance } from "date-fns";
import { ArchiveIcon, TrashIcon, CalendarIcon, BookmarkIcon } from "@heroicons/react/outline";
import React from "react";
import FormErrorMessage from "~/components/FormErrorMessage";
import { Book } from ".prisma/client";
import BackToNowReading from "../components/BackToNowReading";

type LoaderData = {
    book: Book | null;
};

export const loader: LoaderFunction = async ({ request, params }): Promise<LoaderData> => {
    await requireUserId(request, new URL(request.url).pathname);
    const book = await prisma.book.findUnique({
        where: { id: params.bookId },
    });

    return { book };
};

export default function BookDetail() {
    const data = useLoaderData<LoaderData | undefined>();

    return (
        <div>
            <BackToNowReading />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Book Details</h2>
            {data?.book ? (
                <div className="lg:grid lg:grid-cols-3 lg:gap-4">
                    <div className="flex gap-7 items-start bg-gray-100 dark:bg-gray-800 p-8 rounded-3xl lg:col-span-2">
                        <div className="flex flex-col justify-between min-h-full border-r dark:border-gray-500 pr-7">
                            <figure className="w-20 h-20 relative top-1 mb-20">
                                <CircleProgress
                                    color={getStatusDetails(data.book)[1]}
                                    progress={data.book.currentPage / data.book.pageCount}
                                >
                                    {getStatusDetails(data.book)[2]}
                                </CircleProgress>
                                <figcaption className="sr-only">
                                    A progress indicator showing the book is{" "}
                                    {Math.round((data.book.currentPage / data.book.pageCount) * 100)} percent complte
                                </figcaption>
                            </figure>
                            <div className="flex flex-col gap-6 items-center mb-2">
                                <Link
                                    to="update-page"
                                    className="rounded-full p-3 bg-gray-200 dark:bg-gray-700 hover:shadow transition-all duration-150 hover:scale-110 text-purple-500"
                                    aria-label="Update book progress"
                                >
                                    <BookmarkIcon className="w-8 h-8" />
                                </Link>
                                <Link
                                    to="update-goal"
                                    className="rounded-full p-3 bg-gray-200 dark:bg-gray-700 hover:shadow transition-all duration-150 hover:scale-110 text-blue-500"
                                    aria-label="Change target date"
                                >
                                    <CalendarIcon className="w-8 h-8" />
                                </Link>
                                <Link
                                    to="archive-book"
                                    className="rounded-full p-3 bg-gray-200 dark:bg-gray-700 hover:shadow transition-all duration-150 hover:scale-110 text-gray-500 dark:text-gray-400"
                                    aria-label="Archive this book"
                                >
                                    <ArchiveIcon className="w-8 h-8" />
                                </Link>
                                {/* 
                                TODO: Add this icon back once we implement DELETE functionality
                                <button
                                    className="rounded-full p-3 bg-gray-200 dark:bg-gray-700 hover:shadow transition-all duration-150 hover:scale-110 text-red-600"
                                    aria-label="Delete this book"
                                >
                                    <TrashIcon className="w-8 h-8" />
                                </button> */}
                            </div>
                        </div>
                        <div className="w-full">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{data.book.title}</h2>
                            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                                {data.book.author}
                            </h3>
                            <dl>
                                <BookDetailsItem
                                    title="Your Progress"
                                    body={
                                        <>
                                            You&apos;re on page {data.book.currentPage} out of {data.book.pageCount} (
                                            {Math.round((data.book.currentPage / data.book.pageCount) * 100)}% complete)
                                        </>
                                    }
                                />
                                <BookDetailsItem
                                    title={
                                        <>
                                            Today's Goal{" "}
                                            {data.book.goal_targetCalculatedAt ? (
                                                <span className="font-normal text-xs">
                                                    (calculated{" "}
                                                    {formatDistance(
                                                        new Date(data.book.goal_targetCalculatedAt),
                                                        new Date(),
                                                        {
                                                            addSuffix: true,
                                                        },
                                                    )}
                                                    )
                                                </span>
                                            ) : (
                                                <span>(not yet calculated)</span>
                                            )}
                                        </>
                                    }
                                    body={
                                        <>
                                            {getStatusDetails(data.book)[0]} (
                                            {Math.max((data.book.goal_targetPage ?? 0) - data.book.currentPage, 0)} more
                                            pages)
                                        </>
                                    }
                                />
                                <BookDetailsItem
                                    title="Started"
                                    body={formatDistance(new Date(data.book.startDate), new Date(), {
                                        addSuffix: true,
                                    })}
                                />
                                <BookDetailsItem
                                    title="Target Date"
                                    body={new Date(data.book.targetDate).toLocaleDateString()}
                                />
                            </dl>
                        </div>
                    </div>
                    <div className="mt-12 lg:mt-0">
                        <Outlet />
                    </div>
                </div>
            ) : (
                <FormErrorMessage>There was a problem getting the information for this book</FormErrorMessage>
            )}
        </div>
    );
}

function ButtonLink({ to, children }: { to: string; children: React.ReactNode }) {
    return (
        <Link
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 hover:text-black dark:hover:text-gray-100 transition-all duration-150"
            to={to}
        >
            {children}
        </Link>
    );
}

function BookDetailsItem({ title, body }: { title: React.ReactNode; body: React.ReactNode }) {
    return (
        <div className="my-4">
            <dt className="font-semibold text-gray-600 dark:text-gray-300">{title}</dt>
            <dd className="text-sm text-gray-500 dark:text-gray-400">{body}</dd>
        </div>
    );
}