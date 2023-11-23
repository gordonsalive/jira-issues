import { teams } from './config.js';

const millisInADay = 24 * 60 * 60 * 1000;
const millisInAWeek = millisInADay * 7;

const createWeeklyStructure = () => {
    const newDateFromDate = (baseDate, delta) => {
        const OneDay = 86400000;
        const result = new Date((Math.round(baseDate.valueOf() / OneDay) * OneDay));
        result.setDate(baseDate.getDate() + delta);
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
            closedIssuesCount: closedIssuesCount || null,
            averageTimeUntilPrioritised: cycleTimeTotals.totalTimeUntilPrioritised / closedIssuesCount,
            averageTimeUntilInProgress: cycleTimeTotals.totalTimeUntilInProgress / closedIssuesCount,
            averageTimeUntilMerged: cycleTimeTotals.totalTimeUntilMerged / closedIssuesCount,
            averageTimeUntilReleased: cycleTimeTotals.totalTimeUntilReleased / closedIssuesCount,
            averageTimeInReivew: cycleTimeTotals.totalTimeInReivew / closedIssuesCount,
            averageTimeInTranslation: cycleTimeTotals.totalTimeInTranslation / translationIssuesCount,
            averageDevCycleTime: cycleTimeTotals.totalDevCycleTime / closedIssuesCount,
            averageProdCycleTime: cycleTimeTotals.totalProdCycleTime / closedIssuesCount,
            averageProdLeadTime: cycleTimeTotals.totalProdLeadTime / closedIssuesCount,
            averageIssueLeadTime: cycleTimeTotals.totalIssueLeadTime / closedIssuesCount,
            translationIssuesCount: translationIssuesCount || null
        };
    }
);

export { createWeeklyStructure, addIssueStatsToWeeklySummary };
