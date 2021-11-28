import { ActionFunction, LoaderFunction, redirect } from "remix";
import { prisma } from "~/utils/db.server";
import { getUser, getUserId, requireUserId } from "~/utils/session.server";

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

    if (
        typeof title !== "string" ||
        typeof author !== "string" ||
        typeof pageCount !== "string" ||
        typeof currentPage !== "string" ||
        typeof targetDate !== "string"
    ) {
        return {
            formError: "Form submitted incorrectly. All values must be strings",
        };
    }

    const fields = { title, author, pageCount, currentPage, targetDate };

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
            targetDate: new Date(targetDate),
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
        <>
            <h2>Add a book</h2>
            <form method="post">
                <div className="form-input">
                    <label htmlFor="title-input">What's the title of the book?</label>
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
                    <label htmlFor="currentPage-input">On which page are you starting?</label>
                    <input id="currentPage-input" name="currentPage" type="text" />
                </div>
                <div className="form-input">
                    <label htmlFor="targetDate-input">By which date do you want to finish?</label>
                    <input id="targetDate-input" name="targetDate" type="date" />
                </div>
                <button type="submit">Add Book</button>
            </form>
        </>
    );
}
