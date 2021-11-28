import { Book } from ".prisma/client";
import { format } from "date-fns";
import { LinksFunction, ActionFunction, redirect, LoaderFunction, useLoaderData } from "remix";
import { convertBrowserZonedDateToUTC, createNewDailyTarget, shouldUpdateDailyTarget } from "~/utils/book";
import { prisma } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";

import formStyles from "../../styles/forms.css";

export const links: LinksFunction = () => {
    return [
        {
            rel: "stylesheet",
            href: formStyles,
        },
    ];
};

type LoaderData = {
    book: Book;
};

export const loader: LoaderFunction = async ({ request, params }): Promise<LoaderData> => {
    await requireUserId(request, new URL(request.url).pathname);
    const book = await prisma.book.findUnique({
        where: { id: params.bookId },
    });

    if (!book) {
        throw new Error("There was a problem finding this book");
    }

    return { book };
};

export const action: ActionFunction = async ({ request, params }) => {
    const form = await request.formData();
    const targetDate = form.get("targetDate");
    const tzOffsetMin = form.get("tzOffsetMin");

    if (!targetDate || typeof targetDate !== "string" || new Date(targetDate).toString() === "Invalid Date") {
        throw new Error("targetDate is the wrong format");
    }

    if (typeof tzOffsetMin !== "string" || !tzOffsetMin) {
        throw new Error("failed to parse browser timezone for user");
    }

    const book = await prisma.book.update({
        where: { id: params.bookId },
        data: {
            targetDate: convertBrowserZonedDateToUTC(targetDate, tzOffsetMin),
        },
        include: {
            dailyTargets: {
                take: 1,
                orderBy: {
                    calcTime: "desc",
                },
            },
        },
    });

    if (!book) {
        throw new Error("There was a problem updating the current page");
    }

    if (shouldUpdateDailyTarget(book)) {
        await createNewDailyTarget(book);
    }

    return redirect(`/now-reading/${params.bookId}`);
};

export default function UpdateTargetGoal() {
    const data = useLoaderData<LoaderData | undefined>();

    return (
        <form method="post" className="form-container">
            <h2 className="text-xl font-bold">Update Your Target Date</h2>
            <div className="form-input">
                <label htmlFor="targetDate-input">When do you want to finish {data?.book.title}?</label>
                <input
                    type="date"
                    name="targetDate"
                    id="targetDate-input"
                    defaultValue={
                        data?.book.targetDate
                            ? format(new Date(data.book.targetDate), "yyyy-MM-dd")
                            : format(new Date(), "yyyy-MM-dd")
                    }
                />
                <input type="hidden" name="tzOffsetMin" value={new Date().getTimezoneOffset()} />
            </div>
            <button type="submit" className="submit-button mt-1">
                Save Updated Progress
            </button>
        </form>
    );
}
