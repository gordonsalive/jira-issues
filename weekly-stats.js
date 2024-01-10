import { teams } from './config.js';

const millisInADay = 24 * 60 * 60 * 1000;
const millisInAWeek = millisInADay * 7;

const createWeeklyStructure = () => {
    const newDateFromDate = (baseDate, delta) => {
        const OneDay = 86400000;
        const result = new Date((Math.floor(baseDate.valueOf() / OneDay) * OneDay));
        result.setDate(result.getDate() + delta); // getDate & setDate are the day of month, 0 = last day of previous month and so on
        return result;
    };
    const lastSunday = newDateFromDate(new Date(), -((new Date()).getDay() % 7));
    const previousMonday = newDateFromDate(lastSunday, -6);
    const range = [...Array(52).keys()];
    return range.map((week) => ({
        week: newDateFromDate(previousMonday, -(week * 7))
    }));
};

const addIssueStatsToWeeklySummary = (statsByWeek, issuesWithStatusChangesAndCycleTimes, team) => statsByWeek.map(
    (week) => {
        const issuesThatClosedInThisWeek = issuesWithStatusChangesAndCycleTimes.filter(
            (issue) => issue.closedDate.getTime() > week.week.getTime() && issue.closedDate.getTime() < (week.week.getTime() + millisInAWeek)
        );
        // filter this further by team
        const issuesClosedThisWeekByThisTeam = issuesThatClosedInThisWeek.filter((issue) => (team === 'ALL' || teams[team].name === issue.team));
        const closedIssues = issuesClosedThisWeekByThisTeam.map((issue) => issue.issueKey);
        const closedIssuesCount = closedIssues.length;

        const cycleTimeTotals = issuesClosedThisWeekByThisTeam.reduce((prev, issue) => ({
            totalTimeUntilPrioritised: prev.totalTimeUntilPrioritised + issue.cycleTime.timeUntilPrioritised,
            totalTimeUntilInProgress: prev.totalTimeUntilInProgress + issue.cycleTime.timeUntilInProgress,
            totalTimeUntilMerged: prev.totalTimeUntilMerged + issue.cycleTime.timeUntilMerged,
            totalTimeUntilReleased: prev.totalTimeUntilReleased + issue.cycleTime.timeUntilReleased,
            totalTimeInReivew: prev.totalTimeInReivew + issue.cycleTime.timeInReivew,
            totalTimeInTranslation: prev.totalTimeInTranslation + issue.cycleTime.timeInTranslation,
            totalDevCycleTime: prev.totalDevCycleTime + issue.cycleTime.devCycleTime,
            totalProdCycleTime: prev.totalProdCycleTime + issue.cycleTime.prodCycleTime,
            totalProdLeadTime: prev.totalProdLeadTime + issue.cycleTime.prodLeadTime,
            totalIssueLeadTime: prev.totalIssueLeadTime + issue.cycleTime.issueLeadTime
        }), {
            totalTimeUntilPrioritised: 0,
            totalTimeUntilInProgress: 0,
            totalTimeUntilMerged: 0,
            totalTimeUntilReleased: 0,
            totalTimeInReivew: 0,
            totalTimeInTranslation: 0,
            totalDevCycleTime: 0,
            totalProdCycleTime: 0,
            totalProdLeadTime: 0,
            totalIssueLeadTime: 0
        });
        const translationIssuesCount = issuesClosedThisWeekByThisTeam.filter((issue) => issue.cycleTime.timeInTranslation > 0).length;
        return {
            week: week.week,
            closedIssues,
            closedIssuesCount,
            totalTimeUntilPrioritised: cycleTimeTotals.totalTimeUntilPrioritised,
            totalTimeUntilInProgress: cycleTimeTotals.totalTimeUntilInProgress,
            totalTimeUntilMerged: cycleTimeTotals.totalTimeUntilMerged,
            totalTimeUntilReleased: cycleTimeTotals.totalTimeUntilReleased,
            totalTimeInReivew: cycleTimeTotals.totalTimeInReivew,
            totalTimeInTranslation: cycleTimeTotals.totalTimeInTranslation,
            totalDevCycleTime: cycleTimeTotals.totalDevCycleTime,
            totalProdCycleTime: cycleTimeTotals.totalProdCycleTime,
            totalProdLeadTime: cycleTimeTotals.totalProdLeadTime,
            totalIssueLeadTime: cycleTimeTotals.totalIssueLeadTime,
            translationIssuesCount,
            averageTimeUntilPrioritised: closedIssuesCount ? cycleTimeTotals.totalTimeUntilPrioritised / closedIssuesCount : ' ',
            averageTimeUntilInProgress: closedIssuesCount ? cycleTimeTotals.totalTimeUntilInProgress / closedIssuesCount : ' ',
            averageTimeUntilMerged: closedIssuesCount ? cycleTimeTotals.totalTimeUntilMerged / closedIssuesCount : ' ',
            averageTimeUntilReleased: closedIssuesCount ? cycleTimeTotals.totalTimeUntilReleased / closedIssuesCount : ' ',
            averageTimeInReivew: closedIssuesCount ? cycleTimeTotals.totalTimeInReivew / closedIssuesCount : ' ',
            averageTimeInTranslation: translationIssuesCount ? cycleTimeTotals.totalTimeInTranslation / translationIssuesCount : ' ',
            averageDevCycleTime: closedIssuesCount ? cycleTimeTotals.totalDevCycleTime / closedIssuesCount : ' ',
            averageProdCycleTime: closedIssuesCount ? cycleTimeTotals.totalProdCycleTime / closedIssuesCount : ' ',
            averageProdLeadTime: closedIssuesCount ? cycleTimeTotals.totalProdLeadTime / closedIssuesCount : ' ',
            averageIssueLeadTime: closedIssuesCount ? cycleTimeTotals.totalIssueLeadTime / closedIssuesCount : ' '
        };
    }
);

export { createWeeklyStructure, addIssueStatsToWeeklySummary };
