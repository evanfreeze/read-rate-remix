import { Book, DailyTarget } from ".prisma/client";
import { Outlet, Link, LoaderFunction, useLoaderData } from "remix";
import { prisma } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";
import { differenceInCalendarDays, isToday } from "date-fns";
import AddNewBook from "./now-reading/new";

interface BookWithTarget extends Book {
    dailyTargets: DailyTarget[];
}

type LoaderData = {
    books: BookWithTarget[];
};

function calcaulateTargetPage(book: Book): number {
    const daysLeft = differenceInCalendarDays(book.targetDate, new Date());
    const pagesLeft = book.pageCount - book.currentPage;
    const pagesPerDay = Math.ceil(pagesLeft / daysLeft);
    return book.currentPage + pagesPerDay;
}

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

        if (
            !book.dailyTargets.length ||
            !isToday(book.dailyTargets[0].calcTime) ||
            String(book.targetDate) !== String(book.dailyTargets[0].snapshot_targetDate)
        ) {
            const newTarget = await prisma.dailyTarget.create({
                data: {
                    calcTime: new Date(),
                    bookId: book.id,
                    targetPage: calcaulateTargetPage(book),
                    snapshot_currentPage: book.currentPage,
                    snapshot_mode: book.mode,
                    snapshot_pageCount: book.pageCount,
                    snapshot_targetDate: book.targetDate,
                    snapshot_rateGoal: book.rateGoal,
                },
            });
            book.dailyTargets = [newTarget];
        }
    }

    return { books };
};

export default function NowReading() {
    const data = useLoaderData<LoaderData | undefined>();

    return (
        <main>
            <div>
                {data?.books?.length ?? 0 > 0 ? (
                    data?.books.map((book) => <BookRow key={book.id} book={book} />)
                ) : (
                    <>
                        <p>You haven't started any books yet</p>
                    </>
                )}
                <Link to="new">Add a book</Link>
            </div>
            <div>
                <Outlet />
            </div>
            <form action="/logout" method="post">
                <button type="submit">Logout</button>
            </form>
        </main>
    );
}

function BookRow({ book }: { book: BookWithTarget }) {
    const percentComplete = Math.round((book.currentPage / book.pageCount) * 100);
    const targetPage = book.dailyTargets[0].targetPage;
    const pagesRemaining = Math.max(0, targetPage - book.currentPage);

    const getText = () => {
        if (book.currentPage === book.pageCount) {
            return "You've completed the book — congrats!";
        }
        if (book.currentPage < targetPage) {
            return `Read to page ${targetPage} to stay on track`;
        }
        return "You've read enough today";
    };

    return (
        <div>
            <h2>{book.title}</h2>
            <h3>{book.author}</h3>
            <p>{percentComplete}% complete</p>
            <p>
                {getText()} ({pagesRemaining} more pages)
            </p>
        </div>
    );
}
