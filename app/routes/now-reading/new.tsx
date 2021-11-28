import { ActionFunction, LoaderFunction, LinksFunction, redirect } from "remix";
import { convertBrowserZonedDateToUTC } from "~/utils/book";
import { prisma } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";

import formStylesUrl from "../../styles/forms.css";

export const links: LinksFunction = () => {
    return [
        {
            rel: "stylesheet",
            href: formStylesUrl,
        },
    ];
};

export const loader: LoaderFunction = async ({ request }) => {
    await requireUserId(request, "/now-reading/new");
    return null;
};

type ActionData = {
    formError?: string;
    fieldErrors?: {
        title: string | undefined;
        author: string | undefined;
        pageCount: string | undefined;
        currentPage: string | undefined;
        targetDate: string | undefined;
    };
    fields?: {
        title: string;
        author: string;
        pageCount: string;
        currentPage: string;
        targetDate: string;
        tzOffsetMin: string;
    };
};

function validateExistence(value: unknown, label: string) {
    if (typeof value !== "string" || value.trim().length <= 0) {
        return `${label} can't be empty`;
    }
}

function validateNumeric(value: unknown, label: string) {
    if (typeof validateExistence(value, label) === "undefined") {
        if (isNaN(Number(value))) {
            return `${label} must be a number`;
        }
    }

    return validateExistence(value, label);
}

function validateTargetDate(targetDate: unknown) {
    if (typeof validateExistence(targetDate, "") === "undefined") {
        if (new Date(targetDate as Date).toString() === "Invalid Date") {
            return "Target date must be a valid date";
        }
        if (new Date(targetDate as Date) < new Date()) {
            return "Target date can't be in the past";
        }
    }

    return validateExistence(targetDate, "");
}

export const action: ActionFunction = async ({ request }): Promise<ActionData | Response> => {
    const userId = await requireUserId(request, "/now-reading/new");
    const form = await request.formData();
    const title = form.get("title");
    const author = form.get("author");
    const pageCount = form.get("pageCount");
    const currentPage = form.get("currentPage");
    const targetDate = form.get("targetDate");
    const tzOffsetMin = form.get("tzOffsetMin");

    if (
        typeof title !== "string" ||
        typeof author !== "string" ||
        typeof pageCount !== "string" ||
        typeof currentPage !== "string" ||
        typeof targetDate !== "string" ||
        typeof tzOffsetMin !== "string"
    ) {
        return {
            formError: "Form submitted incorrectly. All values must be strings",
        };
    }

    const fields = { title, author, pageCount, currentPage, targetDate, tzOffsetMin };

    const fieldErrors = {
        title: validateExistence(title, "Title"),
        author: validateExistence(author, "Author"),
        pageCount: validateNumeric(pageCount, "Page count"),
        currentPage: validateNumeric(currentPage, "Starting page"),
        targetDate: validateTargetDate(targetDate),
    };

    if (Object.values(fieldErrors).some(Boolean)) {
        return {
            fields,
            fieldErrors,
        };
    }

    if (Number(currentPage) >= Number(pageCount)) {
        return {
            fields,
            formError: "Starting page must be less than the total page count",
        };
    }

    const book = await prisma.book.create({
        data: {
            title,
            author,
            pageCount: Number(pageCount),
            currentPage: Number(currentPage),
            targetDate: convertBrowserZonedDateToUTC(targetDate, tzOffsetMin),
            mode: "date",
            startDate: new Date(),
            readerId: userId,
        },
    });

    if (!book) {
        return {
            fields,
            formError: "Something went wrong adding this book",
        };
    }

    return redirect("/now-reading");
};

export default function AddNewBook() {
    return (
        <div className="max-w-lg mx-auto form-container my-12">
            <h2 className="text-2xl font-bold">Add a Book</h2>
            <form method="post">
                <div className="form-input">
                    <label htmlFor="title-input">What's the title?</label>
                    <input id="title-input" name="title" type="text" />
                </div>
                <div className="form-input">
                    <label htmlFor="author-input">Who's the author?</label>
                    <input id="author-input" name="author" type="text" />
                </div>
                <div className="form-input">
                    <label htmlFor="pageCount-input">How many pages are in it?</label>
                    <input id="pageCount-input" name="pageCount" type="text" />
                </div>
                <div className="form-input">
                    <label htmlFor="currentPage-input">Which page are you starting on?</label>
                    <input id="currentPage-input" name="currentPage" type="text" />
                </div>
                <div className="form-input">
                    <label htmlFor="targetDate-input">When do you want to finish?</label>
                    <input id="targetDate-input" name="targetDate" type="date" />
                </div>
                <input type="hidden" name="tzOffsetMin" value={new Date().getTimezoneOffset()} />
                <button type="submit" className="submit-button mt-3">
                    Add Book
                </button>
            </form>
        </div>
    );
}
