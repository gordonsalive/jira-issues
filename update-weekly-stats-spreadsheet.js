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
            'Closed Date'
        ];
        const data = issues.map((issue) => [
            issue.issueKey, issue.created.substring(0, 10), issue.creator, issue.reporter, issue.assignee, issue.team, issue.status, issue.issueType,
            JSON.stringify(issue.labels).replaceAll(',', ', '), JSON.stringify(issue.statusChanges).replaceAll(',', ', '),
            issue.cycleTime.timeUntilPrioritised, issue.cycleTime.timeUntilInProgress, issue.cycleTime.timeUntilMerged,
            issue.cycleTime.timeUntilReleased, issue.cycleTime.timeInReivew, issue.cycleTime.timeInTranslation,
            issue.cycleTime.devCycleTime, issue.cycleTime.prodCycleTime, issue.cycleTime.prodLeadTime, issue.cycleTime.issueLeadTime,
            issue.closedDate.toString().substring(0, 10)
        ]);

        const rows = [titleRow, headings, ...data];
        const result = await setSheetsDataPromise({
            spreadsheetId: sheetsConfig.weeklyStatsSpreadsheet,
            range: 'Issues!A:V',
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
    const teamNameOrAll = teams[team]?.name || 'ALL';
    console.log('about to call updateWeeklyStatsTab', teamNameOrAll);
    try {
        const titleRow = [`Completed issues, count and average transition/cycletimes for weeks since 2/7/2023.  Transition/cycletime averages are in days. (last updated: ${(new Date()).toUTCString()})`];
        // headings all from issue, except cycle time states which are from issue.cycleTime
        const headings = [
            'Week', 'Closed Issues', 'Closed Issues Count',
            'Average Created -> Prioritised', 'Average Prioritised -> In Progress', 'Average In Progress -> Merged',
            'Average Merged -> Released', 'Average In Review -> To Be Translated', 'Average To Be Translated -> Merged',
            'Average Dev Cycle Time', 'Average Prod Cycle Time',
            'Average Prod Lead Time', 'Average Issue Lead Time', 'Count Issues with Translation'
        ];
        const data = weeklyStats.map((ws) => [
            ws.week, JSON.stringify(ws.closedIssues).replaceAll(',', ', '), ws.closedIssuesCount, ws.averageTimeUntilPrioritised, ws.averageTimeUntilInProgress,
            ws.averageTimeUntilMerged, ws.averageTimeUntilReleased, ws.averageTimeInReivew, ws.averageTimeInTranslation,
            ws.averageDevCycleTime, ws.averageProdCycleTime, ws.averageProdLeadTime, ws.averageIssueLeadTime, ws.translationIssuesCount
        ]);

        const rows = [titleRow, headings, ...data];
        console.log('about to update the spreadsheet');
        const result = await setSheetsDataPromise({
            spreadsheetId: sheetsConfig.weeklyStatsSpreadsheet,
            range: `Weekly_Stats_${teamNameOrAll}!A:O`,
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

export { updateIssuesTab, updateWeeklyStatsTab };
