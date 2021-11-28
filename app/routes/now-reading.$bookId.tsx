import { LoaderFunction, useLoaderData, Outlet, Link } from "remix";
import { requireUserId } from "~/utils/session.server";
import { prisma } from "~/utils/db.server";
import { BookRow, BookWithTarget } from "./now-reading";
import CircleProgress from "~/components/CircleProgress";
import { getStatusDetails } from "~/utils/book";
import { format, formatDistance } from "date-fns";

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
            <Link to="/now-reading" className="text-blue-500">
                ← Back to Now Reading
            </Link>
            <h2 className="text-3xl font-bold text-gray-900 mt-4 mb-6">Book Details</h2>
            {data?.book ? (
                <div className="lg:grid lg:grid-cols-3">
                    <div className="flex gap-7 items-start bg-gray-100 max-w-max p-8 rounded-3xl lg:col-span-2">
                        <figure className="w-20 h-20 relative top-1">
                            <CircleProgress
                                color={getStatusDetails(data.book)[1]}
                                progress={data.book.currentPage / data.book.pageCount}
                            >
                                {getStatusDetails(data.book)[2]}
                            </CircleProgress>
                        </figure>
                        <div className="border-l pl-7">
                            <h2 className="text-2xl font-bold text-gray-800">{data.book.title}</h2>
                            <h3 className="text-lg font-semibold text-gray-600">by {data.book.author}</h3>
                            <dl>
                                <div className="my-4">
                                    <dt className="font-semibold text-gray-600">Your Progress</dt>
                                    <dd className="text-sm text-gray-500">
                                        Read {data.book.currentPage} out of {data.book.pageCount} pages (
                                        {Math.round((data.book.currentPage / data.book.pageCount) * 100)}% complete)
                                    </dd>
                                </div>
                                <div className="my-4">
                                    <dt className="font-semibold text-gray-600">
                                        Today's Goal{" "}
                                        <span className="font-normal text-sm text-gray-600">
                                            (calculated{" "}
                                            {formatDistance(new Date(data.book.dailyTargets[0].calcTime), new Date(), {
                                                addSuffix: true,
                                            })}
                                            )
                                        </span>
                                    </dt>
                                    <dd className="text-sm text-gray-500">
                                        {getStatusDetails(data.book)[0]} (
                                        {Math.max(data.book.dailyTargets[0].targetPage - data.book.currentPage, 0)} more
                                        pages)
                                    </dd>
                                </div>
                                <div className="my-4">
                                    <dt className="font-semibold text-gray-600">Started</dt>
                                    <dd className="text-sm text-gray-500">
                                        {formatDistance(new Date(data.book.startDate), new Date(), { addSuffix: true })}
                                    </dd>
                                </div>
                                <div className="my-4">
                                    <dt className="font-semibold text-gray-600">Target Date</dt>
                                    <dd className="text-sm text-gray-500">
                                        {new Date(data.book.targetDate).toLocaleDateString()}
                                    </dd>
                                </div>
                            </dl>
                            <div className="w-full flex justify-evenly gap-2 mt-12">
                                <Link
                                    className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-xl hover:bg-gray-300 hover:text-black transition-all duration-150"
                                    to="update-goal"
                                >
                                    Change Target Date
                                </Link>
                                <Link
                                    className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-xl hover:bg-gray-300 hover:text-black transition-all duration-150"
                                    to="update-page"
                                >
                                    Update Progress
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="mt-12 lg:mt-0">
                        <Outlet />
                    </div>
                </div>
            ) : (
                <p>There was a problem getting the information for this book</p>
            )}
        </div>
    );
}
