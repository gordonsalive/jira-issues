import { setSheetsDataPromise } from './sheets3.js';
import sheetsConfig from './sheets-config.js';
import { teams } from './config.js';

const updateIssuesTab = async (issues) => {
    console.log(`updating Team Weekly Stats spreadsheet ${(new Date()).toUTCString()}`);

    try {
        const titleRow = [`All Hive Manager board issues.  Transition/cycletimes are in days. (last updated: ${(new Date()).toUTCString()})`];
        // headings all from issue, except cycle time states which are from issue.cycleTime
        const headings = [
            'Issue', 'Created', 'Creator', 'Reporter', 'Assignee', 'Team', 'Status', 'Issue Type', 'Labels',
            'Status Changes',
            'Created -> Prioritised', 'Prioritised -> In Progress', 'In Progress -> Merged', 'Merged -> Released',
            'In Review -> To Be Translated', 'To Be Translated -> Merged', 'Dev Cycle Time: Prioritised -> Merged',
            'Prod Cycle Time: Prioritised -> Released', 'Prod Lead Time: In Progress -> Released', 'Issue Lead Time: Created -> Released',
            'Closed Date', 'Epic', 'Epic Name', 'Story Points', 'T-Shirt Size', 'Week Commencing', 'Month Commencing'
        ];
        const data = issues.map((issue) => [
            issue.issueKey, issue.created.substring(0, 10), issue.creator, issue.reporter, issue.assignee, issue.team, issue.status, issue.issueType,
            JSON.stringify(issue.labels).replaceAll(',', ', '), JSON.stringify(issue.statusChanges).replaceAll(',', ', '),
            issue.cycleTime.timeUntilPrioritised, issue.cycleTime.timeUntilInProgress, issue.cycleTime.timeUntilMerged,
            issue.cycleTime.timeUntilReleased, issue.cycleTime.timeInReivew, issue.cycleTime.timeInTranslation,
            issue.cycleTime.devCycleTime, issue.cycleTime.prodCycleTime, issue.cycleTime.prodLeadTime, issue.cycleTime.issueLeadTime,
            issue.closedDate.toString().substring(0, 15), issue.epic, issue.epicName, issue.storyPoints, issue.tShirtSize,
            issue.weekCommencing.toString().substring(0, 15), issue.monthCommencing.toString().substring(0, 15)
        ]);
        const rows = [titleRow, headings, ...data];
        const result = await setSheetsDataPromise({
            spreadsheetId: sheetsConfig.weeklyStatsSpreadsheet,
            range: 'Issues!A:AA',
            valueInputOption: 'USER_ENTERED',
            resource: {
                majorDimension: 'ROWS',
                values: rows
            },
        });
        console.log(`Rows updated: ${result}`);
    } catch (error) {
        console.error(`Error: ${error}`);
    }
};

const updateWeeklyStatsTab = async (weeklyStats, team) => {
    // const teamNameOrAll = teams[team]?.name || 'ALL';
    const teamNameOrAll = team;
    console.log('about to call updateWeeklyStatsTab', teamNameOrAll);
    try {
        const titleRow = [`Completed issues, count and average transition/cycletimes for weeks since 2/7/2023.  Transition/cycletime averages are in days. (last updated: ${(new Date()).toUTCString()})`];
        // headings all from issue, except cycle time states which are from issue.cycleTime
        const headings = [
            'Week', 'Closed Issues', 'Closed Issues Count',
            'Total Created -> Prioritised', 'Total Prioritised -> In Progress', 'Total In Progress -> Merged',
            'Total Merged -> Released', 'Total In Review -> To Be Translated', 'Total To Be Translated -> Merged',
            'Total Dev Cycle Time', 'Total Prod Cycle Time',
            'Total Prod Lead Time', 'Total Issue Lead Time',
            'Count Issues with Translation',
            'Average Created -> Prioritised', 'Average Prioritised -> In Progress', 'Average In Progress -> Merged',
            'Average Merged -> Released', 'Average In Review -> To Be Translated', 'Average To Be Translated -> Merged',
            'Average Dev Cycle Time', 'Average Prod Cycle Time',
            'Average Prod Lead Time', 'Average Issue Lead Time'
        ];
        const data = weeklyStats.map((ws) => [
            ws.week, JSON.stringify(ws.closedIssues).replaceAll(',', ', '), ws.closedIssuesCount, ws.averageTimeUntilPrioritised, ws.averageTimeUntilInProgress,
            ws.averageTimeUntilMerged, ws.averageTimeUntilReleased, ws.averageTimeInReivew, ws.averageTimeInTranslation,
            ws.averageDevCycleTime, ws.averageProdCycleTime, ws.averageProdLeadTime, ws.averageIssueLeadTime, ws.translationIssuesCount,
            ws.totalTimeUntilPrioritised, ws.totalTimeUntilInProgress,
            ws.totalTimeUntilMerged, ws.totalTimeUntilReleased, ws.totalTimeInReivew, ws.totalTimeInTranslation,
            ws.totalDevCycleTime, ws.totalProdCycleTime, ws.totalProdLeadTime, ws.totalIssueLeadTime,
        ]);

        const rows = [titleRow, headings, ...data];
        console.log('about to update the spreadsheet');
        const result = await setSheetsDataPromise({
            spreadsheetId: sheetsConfig.weeklyStatsSpreadsheet,
            range: `Weekly_Stats_${teamNameOrAll}!A:Y`,
            valueInputOption: 'USER_ENTERED',
            resource: {
                majorDimension: 'ROWS',
                values: rows
            },
        });
        console.log(`Rows updated: ${result}`);
    } catch (error) {
        console.error(`Error: ${error}`);
    }
};

const weekCommencing = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay() + 1);
    return d.toISOString().substring(0, 10);
}

const monthCommencing = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(1);
    return d.toISOString().substring(0, 10);
}

const trimDate = (date) => {
    const d = new Date(date);
    return d.toISOString().substring(0, 10);
}

const updateReviewsTab = async (reviews) => {
    console.log(`updating Reviews tab in Team Weekly Stats spreadsheet ${(new Date()).toUTCString()}`);

    try {
        const titleRow = [`Reviews and notes (comments) from gitlab.  (last updated: ${(new Date()).toUTCString()})`];
        // headings all from review
        const headings = [
            'Date', 'Reviewer', 'Repo', 'Week Commencing', 'Month Commencing', 'Approval Count', 'Note Count'
        ];

        const data = Object.keys(reviews).map((date) => {
            return Object.keys(reviews[date]).map((reviewer) => {
                return Object.keys(reviews[date][reviewer]).map((repo) => {
                    return [
                        trimDate(date), reviewer, repo, weekCommencing(date), monthCommencing(date),
                        reviews[date][reviewer][repo].approval?.length || 0, reviews[date][reviewer][repo].note?.length || 0
                    ];
                })
            }).flat();
        }).flat();

        const rows = [titleRow, headings, ...data];
        const result = await setSheetsDataPromise({
            spreadsheetId: sheetsConfig.weeklyStatsSpreadsheet,
            range: 'Reviews!A:G',
            valueInputOption: 'USER_ENTERED',
            resource: {
                majorDimension: 'ROWS',
                values: rows
            },
        });
        console.log(`Rows updated: ${result}`);
    } catch (error) {
        console.error(`Error: ${error}`);
    }
};

export { updateIssuesTab, updateWeeklyStatsTab, updateReviewsTab };
