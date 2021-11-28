import { ActionFunction, LoaderFunction, redirect } from "remix";
import FormContainer from "~/components/FormContainer";
import { FormInput } from "~/components/FormInput";
import FormLabel from "~/components/FormLabel";
import FormLabeledInput from "~/components/FormLabeledInput";
import FormSubmitButton from "~/components/FormSubmitButton";
import { calculateTargetPage, convertBrowserZonedDateToUTC } from "~/utils/book";
import { prisma } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";

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

    const targetDateInUTC = convertBrowserZonedDateToUTC(targetDate, tzOffsetMin);

    const book = await prisma.book.create({
        data: {
            title,
            author,
            pageCount: Number(pageCount),
            currentPage: Number(currentPage),
            targetDate: targetDateInUTC,
            mode: "date",
            startDate: new Date(),
            readerId: userId,
            goal_targetPage: calculateTargetPage({
                currentPage: Number(currentPage),
                pageCount: Number(pageCount),
                targetDate: targetDateInUTC,
            }),
            goal_targetCalculatedAt: new Date(),
            goal_snapshot_currentPage: Number(currentPage),
            goal_snapshot_mode: "date",
            goal_snapshot_pageCount: Number(pageCount),
            goal_snapshot_targetDate: targetDateInUTC,
            goal_snapshot_rateGoal: null,
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
        <FormContainer className="max-w-lg mx-auto my-12">
            <h2 className="text-2xl font-bold">Add a Book</h2>
            <form method="post">
                <FormLabeledInput>
                    <FormLabel htmlFor="title-input">What's the title?</FormLabel>
                    <FormInput id="title-input" name="title" type="text" />
                </FormLabeledInput>
                <FormLabeledInput>
                    <FormLabel htmlFor="author-input">Who's the author?</FormLabel>
                    <FormInput id="author-input" name="author" type="text" />
                </FormLabeledInput>
                <FormLabeledInput>
                    <FormLabel htmlFor="pageCount-input">How many pages are in it?</FormLabel>
                    <FormInput id="pageCount-input" name="pageCount" type="text" />
                </FormLabeledInput>
                <FormLabeledInput>
                    <FormLabel htmlFor="currentPage-input">Which page are you starting on?</FormLabel>
                    <FormInput id="currentPage-input" name="currentPage" type="text" />
                </FormLabeledInput>
                <FormLabeledInput>
                    <FormLabel htmlFor="targetDate-input">When do you want to finish?</FormLabel>
                    <FormInput id="targetDate-input" name="targetDate" type="date" />
                </FormLabeledInput>
                <input type="hidden" name="tzOffsetMin" value={new Date().getTimezoneOffset()} />
                <FormSubmitButton className="mt-3">Add Book</FormSubmitButton>
            </form>
        </FormContainer>
    );
}
