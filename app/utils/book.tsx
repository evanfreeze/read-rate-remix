import { Book } from ".prisma/client";
import { CheckIcon, ExclamationIcon, StarIcon } from "@heroicons/react/solid";
import { differenceInCalendarDays, isToday } from "date-fns";
import React from "react";
import { HSLColor } from "~/components/CircleProgress";
import { prisma } from "./db.server";

export const BLUE = { h: "217deg", s: "91.2%", l: "59.8%" };
export const GOLD = { h: "43deg", s: "96.4%", l: "56.3%" };
export const GREEN = { h: "158deg", s: "64.4%", l: "51.6%" };
export const GRAY = { h: "215deg", s: "13.8%", l: "34.1%" };

export const getStatusDetails = (book: Book): [string, HSLColor, React.ReactNode] => {
    const targetPage = book.goal_targetPage ?? 0;
    if (book.currentPage === book.pageCount) {
        return ["You've completed the book — congrats!", GOLD, <StarIcon className="w-10 h-10" />];
    }
    if (book.currentPage < targetPage) {
        return [`Read to page ${targetPage} to stay on track`, BLUE, <span>{targetPage - book.currentPage}</span>];
    }
    if (book.currentPage < book.pageCount && new Date(book.targetDate) < new Date()) {
        return [`Pick a new target date to get back on track`, GRAY, <ExclamationIcon className="w-10 h-10" />];
    }
    return ["You've read enough today to stay on track", GREEN, <CheckIcon className="w-10 h-10" />];
};

export function convertBrowserZonedDateToUTC(browserDate: string, tzOffsetMin: string) {
    // This makes sure we're storing the UTC time in the database that corresponds to midnight on the date the user selected in their local timezone
    return new Date(new Date(browserDate).getTime() + Number(tzOffsetMin) * 60 * 1000);
}

export function shouldUpdateDailyTarget(book: Book) {
    return (
        !book.goal_targetPage ||
        !book.goal_targetCalculatedAt ||
        !isToday(book.goal_targetCalculatedAt) ||
        String(book.targetDate) !== String(book.goal_snapshot_targetDate)
    );
}

type BookFieldsForTargetCalculation = Pick<Book, "targetDate" | "currentPage" | "pageCount">;

export function calculateTargetPage(partialBook: BookFieldsForTargetCalculation): number {
    const daysLeft = differenceInCalendarDays(partialBook.targetDate, new Date()) + 1;
    const pagesLeft = partialBook.pageCount - partialBook.currentPage;
    const pagesPerDay = Math.ceil(pagesLeft / daysLeft);
    return partialBook.currentPage + pagesPerDay;
}

export async function updateBookTarget(book: Book) {
    const newTarget = await prisma.book.update({
        where: { id: book.id },
        data: {
            goal_targetCalculatedAt: new Date(),
            goal_targetPage: calculateTargetPage(book),
            goal_snapshot_currentPage: book.currentPage,
            goal_snapshot_mode: book.mode,
            goal_snapshot_pageCount: book.pageCount,
            goal_snapshot_targetDate: book.targetDate,
            goal_snapshot_rateGoal: book.rateGoal,
        },
    });

    return newTarget;
}
