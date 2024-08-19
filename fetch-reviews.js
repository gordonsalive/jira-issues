// This will get the reviews for the repos I'm interested in.
// The url is the first part of the URL of the repos we use and then the api part:
//  https://<gitlab.server.url>/api/v4/projects
// Reviews are in the merge_requests part of the project:
// https://<gitlab.server.url>/api/v4/projects/<project_id>/merge_requests
// see this documentation: https://docs.gitlab.com/ee/api/merge_requests.html 

// to get MR approvals, it looks like I need to get the MR and then the approvals for that MR:
// https://<gitlab.server.url>/api/v4/projects/<project_id>/merge_requests/<merge_request_iid>/approvals
// see this documentation: https://docs.gitlab.com/ee/api/merge_request_approvals.html

// we aren't interested in renovate reviews, so we will filter these out.
// we aren't interested in reviews or notes from <team>.gl, so we will filter these out.
// we aren't interested in reviews or notes from where author and reviewer/note maker are the same, so we will filter these out.

// Notes (review comments) are in the notes part of the merge_requests part of the project:
// https://<gitlab.server.url>/api/v4/projects/<project_id>/merge_requests/<merge_request_iid>/notes
// see this documentation: https://docs.gitlab.com/ee/api/notes.html#merge-requests 
import fetch from 'node-fetch';
import { GITLAB_ORG_STRING, repos, filteredTeamUsername, filteredAuthors } from './tokens.js';

const fetchReviews = async () => {
    const throttle = (millis=5) => new Promise((resolve) => setTimeout(resolve, millis));
    const fetchReviewsForRepo = async (project_id, accessToken, page = 1) => {
        console.log(`fetchReviewsForRepo: ${project_id} - ${page}`);
        try {
            await throttle();
            const response = await fetch(
                `https://${GITLAB_ORG_STRING}/api/v4/projects/${project_id}/merge_requests?state=merged&created_after=2024-01-01T08:00:00Z&order_by=created_at&sort=asc&per_page=100&page=${page}`,
                {
                    method: 'GET',
                    headers: {
                        "PRIVATE-TOKEN": accessToken,
                        "Content-Type": 'application/json'
                    }
                }
            );
            const reviews = await response.json();
            // console.log(`Response: ${project_id} - ${response.status} ${response.statusText}, page: ${page}`);
            // console.log('about to fetch next page');
            const headers = response.headers;
            const XNextPage = headers.get('x-next-page');
            // console.log('about to fetch next page:', XNextPage, project_id);
            if (XNextPage) {
                return [...reviews, ...(await fetchReviewsForRepo(project_id, accessToken, XNextPage))];
                // const nextReviews = await fetchReviewsForRepo(project_id, accessToken, XNextPage);
                // return [...reviews, ...nextReviews];
            }
            return reviews;
        } catch (error) {
            console.error(`Error: fetchReviewsForRepo ${project_id} - ${page}: ${error}`);
            return [];
        }
    };
    const fetchApprovalsForMR = async (project_id, merge_request_iid, accessToken) => {
        try {
            await throttle();
            const response = await fetch(
                `https://${GITLAB_ORG_STRING}/api/v4/projects/${project_id}/merge_requests/${merge_request_iid}/approvals?per_page=100`,
                {
                    method: 'GET',
                    headers: {
                        "PRIVATE-TOKEN": accessToken,
                        "Content-Type": 'application/json'
                    }
                }
            );
            // console.log(`Response: ${response.status} ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error(`Error: fetchApprovalsForMR ${project_id} - ${merge_request_iid}: ${error}`);
            return {};
        }
    };
    const fetchNotesForMR = async (project_id, merge_request_iid, accessToken) => {
        try {
            await throttle();
            const response = await fetch(
                `https://${GITLAB_ORG_STRING}/api/v4/projects/${project_id}/merge_requests/${merge_request_iid}/notes?per_page=100`,
                {
                    method: 'GET',
                    headers: {
                        "PRIVATE-TOKEN": accessToken,
                        "Content-Type": 'application/json'
                    }
                }
            );
            // console.log(`Response: ${response.status} ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error(`Error: fetchNotesForMR ${project_id} - ${merge_request_iid} : ${error}`);
            return [];
        }
    };

    const reposKeys = Object.keys(repos);
    const reviews = await Promise.all(
        reposKeys.map(async (repo) => {
            const { id: project_id, projectAccessToken: accessToken, name: project_name } = repos[repo];

            const reviewsForRepo = await fetchReviewsForRepo(project_id, accessToken);
            // console.log(`reviewsForRepo: ${project_name} - ${reviewsForRepo.length}`);
            return await Promise.all(
                reviewsForRepo.map(async (merge_request, index) => {
                    const mergeRequestData = (merge_request) => {
                        const { id, iid, project_id, title, state, created_at, user_notes_count, target_branch, author } = merge_request;
                        return { id, iid, project_id, project_name, title, state, created_at, user_notes_count, target_branch, author_username: author.username, author_name: author.name };
                    };
                    const approvalsData = (approvals) => {
                        const approved_by = approvals.approved_by.map((user) => user.user.username)
                            .filter((username) => username !== merge_request.author.username)
                            .filter((username) => username !== filteredTeamUsername);
                        const { id, iid, created_at, updated_at, approved, approvals_required, approvals_left } = approvals;
                        return { id, iid, created_at, updated_at, approved, approvals_required, approvals_left, approved_by };
                    };
                    const notesData = (notes) => {
                        return notes.map((note) => {
                            const { id, body, created_at, updated_at, author, type } = note;
                            return { id, body, created_at, updated_at, author_username: author.username, author_name: author.name, type };
                        })
                            .filter((note) => note.author_username !== merge_request.author.username)
                            .filter((note) => filteredAuthors.includes(note.author_name) === false);
                    };

                    // space out the requests - the mapping will happen very fast and then the promises will start running all at once. Alternatively, resolve promises in a for-in loop or recursive function.
                    await throttle(index * 10);

                    const approvalsForMr = await fetchApprovalsForMR(project_id, merge_request.iid, accessToken);
                    // console.log(`approvalsForMR: ${project_name} - ${approvalsForMr.approved_by.length}`);

                    const notesForMR = await fetchNotesForMR(project_id, merge_request.iid, accessToken);
                    // console.log(`notesForMR: ${project_name} - ${notesForMR.length}`);

                    return {
                        ...mergeRequestData(merge_request),
                        approvals: approvalsData(approvalsForMr),
                        notes: notesData(notesForMR),
                    };
                })
            );
        })
    );
    const flattenedReviews = reviews.flat();
    // console.log(`flattenedReviews: ${flattenedReviews.length}`);
    const filteredReviews = flattenedReviews.filter((review) => filteredAuthors.includes(review.author_name) === false);  // !== 'Renovate');
    // console.log(`filteredReviews: ${filteredReviews.length}`);
    return filteredReviews;
}

export default fetchReviews;