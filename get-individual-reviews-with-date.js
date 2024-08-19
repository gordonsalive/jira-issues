// I have a list of reviews and comments and I want to convert this to a list of approvals with dates

import fetchReviews from './fetch-reviews.js';

const truncateDateTimeToDate = (date) => {
    const dateObject = new Date(date);
    return new Date(dateObject.getFullYear(), dateObject.getMonth(), dateObject.getDate());
}

const getReviewApprovalsAndComments = async () => {
    const reviews = await fetchReviews();
    const approvalsWithDate = reviews.map((review) =>
        review.approvals.approved_by.map((approver) => ({
            type: 'approval',
            reviewee_username: review.author_username,
            repo: review.project_name,
            reviewer: approver,
            date: truncateDateTimeToDate(review.approvals.updated_at)
        }))
    ).flat();
        // .filter((approval) => approval.reviewer === 'alan.gordon1');
        // .filter((approval) => approval.reviewer === 'm.scripps');
    // console.log('approvalsWithDate:', approvalsWithDate);
    const notesWithDate = reviews.map((review) =>
        review.notes.map((note) => ({
            type: 'note',
            reviewee_username: review.author_username,
            repo: review.project_name,
            reviewer: note.author_username,
            date: truncateDateTimeToDate(note.created_at)
        }))
    ).flat();
        // .filter((approval) => approval.reviewer === 'alan.gordon1');
        // .filter((approval) => approval.reviewer === 'm.scripps');
    // console.log('notesWithDate:', notesWithDate);
    return [approvalsWithDate, notesWithDate].flat();
}

const approvalsAndComments = async () => await getReviewApprovalsAndComments();

// from node 21 I will have Object.groupBy, but I'm on Node 20 at the moment :-(
// const groupedByDate = Object.groupBy(approvalsAndComments, 'date');
const groupBy = (arr, by) => arr.reduce((acc, item) => {
    const key = item[by];
    if (!acc[key]) {
        acc[key] = [];
    }
    acc[key].push(item);
    return acc;
}, {});

// first we take the array of approvals and comments and group by date
const groupedByDate = async () => groupBy(await approvalsAndComments(), 'date');

const individualReviewsWithDate = async () => {
    // now we have an object with dates as keys and an array of approvals and comments as values
    // I want to group by date, then by reviewer, then by repo, then by type
    const reviewsGroupedByDate = await groupedByDate();
    const dates = Object.keys(reviewsGroupedByDate);
    const groupByDateAndReviewerAndRepoAndType = dates.reduce((acc, date) => {
        acc[date] = groupBy(reviewsGroupedByDate[date], 'reviewer');
        // now I have an object with dates as keys and inside it and object with reviewers as keys
        // and I can use the list of reviewers to group by repo
        const reviewers = Object.keys(acc[date]);
        acc[date] = reviewers.reduce((acc2, reviewer) => {
            acc2[reviewer] = groupBy(acc[date][reviewer], 'repo');
            // now I have an object with reviewers as keys and inside it an object with repos as keys
            // and I can use the list of repos to group by type
            const repos = Object.keys(acc2[reviewer]);
            acc2[reviewer] = repos.reduce((acc3, repo) => {
                acc3[repo] = groupBy(acc2[reviewer][repo], 'type');
                // now I have an object with repos as keys and inside it an object with types as keys
                // I can return this object
                return acc3;
            }, {});
            // now I have an object with reviewers as keys and inside it an object with repos as keys and inside it an object with types as keys
            // I can return this object
            return acc2;
        }, {});
        // now I have an object with dates as keys and inside it an object with reviewers as keys and inside it an object with repos as keys and inside it an object with types as keys
        // I can return this object
        return acc;
    }, {});
    // console.log('groupByDateAndReviewerAndRepoAndType:', JSON.stringify(groupByDateAndReviewerAndRepoAndType, null, 2));
    return groupByDateAndReviewerAndRepoAndType;
};

export default individualReviewsWithDate;