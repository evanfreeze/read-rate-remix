import { CheckIcon, StarIcon } from "@heroicons/react/solid";
import React from "react";
import { HSLColor } from "~/components/CircleProgress";
import { BookWithTarget } from "~/routes/now-reading";

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
