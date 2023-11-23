// this will fetch a summary of all the closed issues
// then it will fetch the history for each closed issue
// then it will transform this into summary data
// and finally I will push this to a spreadsheet.
import issueHistoryPromise from './fetch-issue-history.js';
import issuesPromise from './fetch-all-closed-issues.js';

const issueWithStatusChanges = async (issue) => {
    const issueHistory = await issueHistoryPromise(issue.issueKey);
    const statusChanges = issueHistory.statusChangeSummary;

    return {
        ...issue,
        statusChanges
    };
};

const getIssuesWithStatusChanges = async () => {
    const aggregateIssuesWithStatusChanges = async (issues) => {
        if (issues.length > 0) {
            console.log('..left to fetch:', issues.length);
            const issuesToFetch = [...issues];
            const issue = issuesToFetch.shift();
            return [await issueWithStatusChanges(issue), ...(await aggregateIssuesWithStatusChanges(issuesToFetch))];
        }
        return [];
    };

    const closedIssues = await issuesPromise();

    // Firing them all at one is too much for JIRA, so fire them sequentially
    // const issuesWithStatusChanges = await Promise.all(closedIssues.issues.map((issue) => issueWithStatusChanges(issue)));
    return aggregateIssuesWithStatusChanges(closedIssues.issues);
};

export default getIssuesWithStatusChanges;
