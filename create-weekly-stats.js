// this will take the summary of issues with statuc changes and map them onto weekly stats for the last year.

import getIssuesWithStatusChanges from './get-issue-status-summary.js';
import addCycleTime from './add-cycle-time.js';
import { updateIssuesTab, updateWeeklyStatsTab, updateReviewsTab } from './update-weekly-stats-spreadsheet.js';
import { createWeeklyStructure, addIssueStatsToWeeklySummary } from './weekly-stats.js';
import getReviewApprovalsAndComments from './get-individual-reviews-with-date.js';
import { teams } from './config.js';

const mainLoop = async () => {
    const statsByWeek = {};
    const weeklySummaryWithIssueStats = {};
    // get all our issues with status changes
    console.log('getting issues with status changes...');
    const issuesWithStatusChanges = await getIssuesWithStatusChanges();

    // update the status change info with cycle time info, ready for use later. ==> this will go into one spreadsheet tab
    const issuesWithStatusChangesAndCycleTimes = addCycleTime(issuesWithStatusChanges);

    // upload the list of issues to the googlesheet:
    console.log('updating issues tab...');
    await updateIssuesTab(issuesWithStatusChangesAndCycleTimes);

    // updaload the weekly stats for all and each 'team'
    const createWeeklyStats = async (tabs) => {
        const teamsLoop = [...tabs];
        const team = teamsLoop.shift();
        // create an object for the last 52 weeks, in reverse order
        statsByWeek[team] = createWeeklyStructure();
        console.log('team:', team);

        // cycle through the statsByWeek
        // (inside this cycle through the issuesWithStatusChanges and reduce into my final stats ==> another spreadsheet tab)
        weeklySummaryWithIssueStats[team] = addIssueStatsToWeeklySummary(statsByWeek[team], issuesWithStatusChangesAndCycleTimes, team);
        // if (team === 'sofiaTeam') {
        //     console.log(team, weeklySummaryWithIssueStats[team]);
        // }
        // updload these results to a googlesheet
        console.log('updating weekly stats team tab...', team);
        await updateWeeklyStatsTab(weeklySummaryWithIssueStats[team], team);
        if (teamsLoop.length > 0) {
            await createWeeklyStats(teamsLoop);
        }
    };
    console.log('creating weekly stats...');
    await createWeeklyStats(['ALL', ...Object.keys(teams)]);

    // get reviews and comments from gitlab
    console.log('getting reviews and comments...');
    const reviews = await getReviewApprovalsAndComments();
    // update the reviews tab in the googlesheet
    console.log('updating reviews tab...');
    await updateReviewsTab(reviews);

    console.log('done.');
};

mainLoop();
