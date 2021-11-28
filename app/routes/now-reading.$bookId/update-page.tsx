import { Book } from ".prisma/client";
import { LinksFunction, ActionFunction, redirect, LoaderFunction, useLoaderData } from "remix";
import FormContainer from "~/components/FormContainer";
import { FormInput } from "~/components/FormInput";
import FormLabel from "~/components/FormLabel";
import FormLabeledInput from "~/components/FormLabeledInput";
import FormSubmitButton from "~/components/FormSubmitButton";
import { prisma } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";

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
    const currentPage = form.get("currentPage");

    if (!currentPage || typeof currentPage !== "string" || isNaN(Number(currentPage)))
        throw new Error("currentPage is the wrong format");

    const book = await prisma.book.update({
        where: { id: params.bookId },
        data: {
            currentPage: Number(currentPage),
        },
    });

    if (!book) {
        throw new Error("There was a problem updating the current page");
    }

    return redirect(`/now-reading/${params.bookId}`);
};

export default function UpdateCurrentPage() {
    const data = useLoaderData<LoaderData | undefined>();

    return (
        <FormContainer>
            <form method="post">
                <h2 className="text-xl font-bold">Update Your Progress</h2>
                <FormLabeledInput>
                    <FormLabel htmlFor="currentPage-input">Which page are you on?</FormLabel>
                    <FormInput
                        type="text"
                        name="currentPage"
                        id="currentPage-input"
                        defaultValue={data?.book.currentPage}
                    />
                </FormLabeledInput>
                <FormSubmitButton className="mt-1">Save Updated Progress</FormSubmitButton>
            </form>
        </FormContainer>
    );
}
