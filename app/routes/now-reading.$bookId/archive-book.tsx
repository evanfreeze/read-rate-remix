import { ActionFunction, redirect, LoaderFunction, Link, useParams } from "remix";
import FormContainer from "~/components/FormContainer";
import FormSubmitButton from "~/components/FormSubmitButton";
import { prisma } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
    await requireUserId(request, new URL(request.url).pathname);
    return null;
};

export const action: ActionFunction = async ({ request, params }) => {
    await requireUserId(request);

    const book = await prisma.book.update({
        where: { id: params.bookId },
        data: {
            archivedAt: new Date(),
        },
    });

    if (!book) {
        throw new Error("There was a problem archiving this book");
    }

    return redirect(`/archive`);
};

export default function UpdateCurrentPage() {
    const params = useParams();

    return (
        <FormContainer>
            <form method="post" className="flex flex-col gap-4">
                <h2 className="text-xl font-bold">Confirm Archive</h2>
                <p className="text-sm">Are you sure you want to archive this book?</p>
                <p className="text-sm">You can always restore it from the "Archived Books" page if you want it back</p>
                <FormSubmitButton className="mt-3">Yes, archive it</FormSubmitButton>
                <Link to={`/now-reading/${params.bookId}`} className="text-center underline hover:text-blue-500">
                    No, don't archive it
                </Link>
            </form>
        </FormContainer>
    );
}
