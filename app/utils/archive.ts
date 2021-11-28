import { Book } from ".prisma/client";
import { format } from "date-fns";

export function groupArchivedBooksByMonth(archivedBooks: Book[]) {
    const booksWithMonth = archivedBooks.map((book) => {
        if (!book.archivedAt) throw new Error("This function can only be called with an array of archived books");
        const month = format(new Date(book.archivedAt!), "MMMM yyyy");

        return { month, book };
    });

    return booksWithMonth.reduce((result, bookWithMonth) => {
        if (result[bookWithMonth.month]?.length) {
            result[bookWithMonth.month].push(bookWithMonth.book);
        } else {
            result[bookWithMonth.month] = [bookWithMonth.book];
        }
        return result;
    }, {} as Record<string, Book[]>);
}
