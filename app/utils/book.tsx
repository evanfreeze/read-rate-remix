import { Book } from ".prisma/client";
import { CheckIcon, StarIcon } from "@heroicons/react/solid";
import { differenceInCalendarDays, isToday } from "date-fns";
import React from "react";
import { HSLColor } from "~/components/CircleProgress";
import { BookWithTarget } from "~/routes/now-reading";
import { prisma } from "./db.server";

export const BLUE = { h: "217deg", s: "91.2%", l: "59.8%" };
export const GOLD = { h: "43deg", s: "96.4%", l: "56.3%" };
export const GREEN = { h: "158deg", s: "64.4%", l: "51.6%" };

export const getStatusDetails = (book: BookWithTarget): [string, HSLColor, React.ReactNode] => {
    const targetPage = book.dailyTargets[0].targetPage;
    if (book.currentPage === book.pageCount) {
        return ["You've completed the book — congrats!", GOLD, <StarIcon className="w-10 h-10" />];
    }
    if (book.currentPage < targetPage) {
        return [`Read to page ${targetPage} to stay on track`, BLUE, <span>{targetPage - book.currentPage}</span>];
    }
    return ["You've read enough today to stay on track", GREEN, <CheckIcon className="w-10 h-10" />];
};

export function shouldUpdateDailyTarget(book: BookWithTarget) {
    return (
        !book.dailyTargets.length ||
        !isToday(book.dailyTargets[0].calcTime) ||
        String(book.targetDate) !== String(book.dailyTargets[0].snapshot_targetDate)
    );
}

export function calcaulateTargetPage(book: Book): number {
    const daysLeft = differenceInCalendarDays(book.targetDate, new Date());
    const pagesLeft = book.pageCount - book.currentPage;
    const pagesPerDay = Math.ceil(pagesLeft / daysLeft);
    return book.currentPage + pagesPerDay;
}

export async function createNewDailyTarget(book: BookWithTarget) {
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

    return newTarget;
}
