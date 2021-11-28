import { LoaderFunction, useLoaderData, Outlet, Link } from "remix";
import { requireUserId } from "~/utils/session.server";
import { prisma } from "~/utils/db.server";
import { BookWithTarget } from "./now-reading";
import CircleProgress from "~/components/CircleProgress";
import { getStatusDetails } from "~/utils/book";
import { formatDistance } from "date-fns";
import { ChevronLeftIcon } from "@heroicons/react/solid";
import React from "react";
import FormErrorMessage from "~/components/FormErrorMessage";

type LoaderData = {
    book: BookWithTarget | null;
};

export const loader: LoaderFunction = async ({ request, params }): Promise<LoaderData> => {
    await requireUserId(request, new URL(request.url).pathname);
    const book = await prisma.book.findUnique({
        where: { id: params.bookId },
        include: {
            dailyTargets: {
                take: 1,
                orderBy: {
                    calcTime: "desc",
                },
            },
        },
    });

    return { book };
};

export default function BookDetail() {
    const data = useLoaderData<LoaderData | undefined>();

    return (
        <div>
            <Link
                to="/now-reading"
                className="text-blue-500 flex items-center font-semibold relative -left-1.5 max-w-max"
            >
                <ChevronLeftIcon className="w-5 h-5 relative" style={{ top: "1px" }} /> Now Reading
            </Link>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-4 mb-6">Book Details</h2>
            {data?.book ? (
                <div className="lg:grid lg:grid-cols-3 lg:gap-4">
                    <div className="flex gap-7 items-start bg-gray-100 dark:bg-gray-800 p-8 rounded-3xl lg:col-span-2">
                        <figure className="w-20 h-20 relative top-1">
                            <CircleProgress
                                color={getStatusDetails(data.book)[1]}
                                progress={data.book.currentPage / data.book.pageCount}
                            >
                                {getStatusDetails(data.book)[2]}
                            </CircleProgress>
                        </figure>
                        <div className="border-l dark:border-gray-500 pl-7 w-full">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{data.book.title}</h2>
                            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                                by {data.book.author}
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
                                            <span className="font-normal text-xs">
                                                (calculated{" "}
                                                {formatDistance(
                                                    new Date(data.book.dailyTargets[0].calcTime),
                                                    new Date(),
                                                    {
                                                        addSuffix: true,
                                                    },
                                                )}
                                                )
                                            </span>
                                        </>
                                    }
                                    body={
                                        <>
                                            {getStatusDetails(data.book)[0]} (
                                            {Math.max(data.book.dailyTargets[0].targetPage - data.book.currentPage, 0)}{" "}
                                            more pages)
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
                            <div className="w-full flex justify-center gap-2 mt-12">
                                <ButtonLink to="update-goal">Change Target Date</ButtonLink>
                                <ButtonLink to="update-page">Update Progress</ButtonLink>
                            </div>
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