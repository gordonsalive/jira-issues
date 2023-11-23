// This code sample uses the 'node-fetch' library:
// https://www.npmjs.com/package/node-fetch
// this code is copied from atlassian (JIRA) docs: https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-search/#api-rest-api-3-search-get
import fetch from 'node-fetch';
import { AUTH_STRING, ORG_STRING } from './tokens.js';
import { startDate, teamFromAssignee } from './config.js';
// const AUTH_STRING = `Basic ${Buffer.from('email@example.com:<api_token>').toString('base64')}`;
// ORG_STRING = your-domain

// The overall return is a list of issues:
// {
//     expand: "schema,names",
//     startAt: 0,
//     maxResults: 50,
//     total: 2011,
//     issues: []
// }

// issues is a list of issues like this, where fields is hundred of cutom fields!:
// {
//     expand: "customfield_13566.properties,customfield_11882.properties,...",
//     id: "963288",
//     self: "https://<>.atlassian.net/rest/api/3/issue/963288",
//     key: "CHO-2324",
//     fields: {}
// },

// (sometimes the custom fields have a name, sometimes they aren't custom fields, like: created, priority, updated,
//  assignee which is complex object with emailAddress in it, status, creator, project, reporter, labels, issuetype, resolution):
// issuetype: {
//     self: "https://<>.atlassian.net/rest/api/3/issuetype/10101",
//     id: "10101",
//     description: "A task that needs to be done.",
//     iconUrl: "https://<>.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10318?size=medium",
//     name: "Task",
//     subtask: false,
//     avatarId: 10318,
//     hierarchyLevel: 0
// },
// reporter: {
//     self: "https://<>.atlassian.net/rest/api/3/user?accountId=5b7be2b4cd0cc72a612c9743",
//     accountId: "5b7be2b4cd0cc72a612c9743",
//     emailAddress: "xavier.bertothy@ocado.com",
//     avatarUrls: {
//     48x48: "https://secure.gravatar.com/avatar/80952faff2f6504d0eaa3dd79469d4b3?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FXB-4.png",
//     24x24: "https://secure.gravatar.com/avatar/80952faff2f6504d0eaa3dd79469d4b3?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FXB-4.png",
//     16x16: "https://secure.gravatar.com/avatar/80952faff2f6504d0eaa3dd79469d4b3?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FXB-4.png",
//     32x32: "https://secure.gravatar.com/avatar/80952faff2f6504d0eaa3dd79469d4b3?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FXB-4.png"
//     },
//     displayName: "Xavier Bertothy",
//     active: true,
//     timeZone: "Europe/London",
//     accountType: "atlassian"
// },
// priority: {
//     self: "https://<>.atlassian.net/rest/api/3/priority/10004",
//     iconUrl: "https://confluence.atlassian.com/jirakb/files/779160907/779160908/1/1426092115651/transparent.gif",
//     name: "None",
//     id: "10004"
// },
// created: "2023-11-01T08:37:34.280+0000",
// assignee: {
//     self: "https://<>.atlassian.net/rest/api/3/user?accountId=5b7be2b4cd0cc72a612c9743",
//     accountId: "5b7be2b4cd0cc72a612c9743",
//     emailAddress: "xavier.bertothy@ocado.com",
//     avatarUrls: {
//     48x48: "https://secure.gravatar.com/avatar/80952faff2f6504d0eaa3dd79469d4b3?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FXB-4.png",
//     24x24: "https://secure.gravatar.com/avatar/80952faff2f6504d0eaa3dd79469d4b3?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FXB-4.png",
//     16x16: "https://secure.gravatar.com/avatar/80952faff2f6504d0eaa3dd79469d4b3?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FXB-4.png",
//     32x32: "https://secure.gravatar.com/avatar/80952faff2f6504d0eaa3dd79469d4b3?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FXB-4.png"
//     },
//     displayName: "Xavier Bertothy",
//     active: true,
//     timeZone: "Europe/London",
//     accountType: "atlassian"
// },
// status: {
//     self: "https://<>.atlassian.net/rest/api/3/status/10621",
//     description: "Issue is technically released and available to at least one retail clients or client site on OSP",
//     iconUrl: "https://<>.atlassian.net/images/icons/statuses/generic.png",
//     name: "Released",
//     id: "10621",
//     statusCategory: {
//        self: "https://<>.atlassian.net/rest/api/3/statuscategory/3",
//        id: 3,
//        key: "done",
//        colorName: "green",
//        name: "Done"
//     }
// },
// creator: {
//     self: "https://<>.atlassian.net/rest/api/3/user?accountId=5b7be2b4cd0cc72a612c9743",
//     accountId: "5b7be2b4cd0cc72a612c9743",
//     emailAddress: "xavier.bertothy@ocado.com",
//     avatarUrls: {
//     48x48: "https://secure.gravatar.com/avatar/80952faff2f6504d0eaa3dd79469d4b3?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FXB-4.png",
//     24x24: "https://secure.gravatar.com/avatar/80952faff2f6504d0eaa3dd79469d4b3?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FXB-4.png",
//     16x16: "https://secure.gravatar.com/avatar/80952faff2f6504d0eaa3dd79469d4b3?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FXB-4.png",
//     32x32: "https://secure.gravatar.com/avatar/80952faff2f6504d0eaa3dd79469d4b3?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FXB-4.png"
//     },
//     displayName: "Xavier Bertothy",
//     active: true,
//     timeZone: "Europe/London",
//     accountType: "atlassian"
// },
// labels: [
//     "1000778-OT_600s-Charging-Solution",
//     "DASH",
//     "HM_SOFIA",
//     "Q4_2023"
// ],

// I want to end up with:
// {
//     issueKey: results.issues[].key,
//     creator: results.issues[].fields['creator'].emailAddress,
//     reporter: results.issues[].fields['reporter'].emailAddress,
//     status: results.issues[].fields['status'].name, // always Released for closed issues.
//     assignee: results.issues[].fields['assignee'].emailAddress,
//     issueType: results.issues[].fields['issuetype'].name,
//     labels" results.issues[].fields['labels'][]
// }

// It appears our instance will only return 100 results at a time! I'll need to look at maxResults and total in the results then call again passing in
//   a new startAt.  There's a lot of waste in the returned data, so rather than holding all that in memory, I can parse each chunk in a loop
//   concatenating my processed results after each loop.  I could spawn these off as promises, but actually I'd like my machine to have a
//   chance to process each chunk, rather than running out of memory!

// The data from before 2/7/2023 has status changes showing it resolved on 29/6/2023, so not useful for calculating states in future.
const issuesPromise = (fetchStartAt = 0) => fetch(
    `https://${ORG_STRING}.atlassian.net/rest/api/3/search?jql=project%20%3D%20CHO%20AND%20STATUS%20IN%20(Merged,%20Released)%20AND%20resolved>="${startDate}"&maxResults=3000&startAt=${fetchStartAt}`,
    {
        method: 'GET',
        headers: {
            Authorization: AUTH_STRING,
            Accept: 'application/json'
        }
    }
)
    .then((response) => {
        console.log(
            `Response: ${response.status} ${response.statusText}, fetchStartAt: ${fetchStartAt}`
        );
        return response.text();
    })
    .then((text) => JSON.parse(text))
    .then(({
        issues, startAt, maxResults, total
    }) => ({
        releasedIssues: issues.filter((issue) => issue.fields.status.name === 'Released'),
        startAt,
        maxResults,
        total
    }))
    .then(({
        releasedIssues, startAt, maxResults, total
    }) => ({
        issues: releasedIssues.map((issue) => ({
            issueKey: issue.key,
            created: issue.fields.created,
            creator: issue.fields.creator.emailAddress,
            reporter: issue.fields?.reporter?.emailAddress,
            assignee: issue.fields?.assignee?.emailAddress,
            team: teamFromAssignee((issue.fields?.assignee) ? issue.fields?.assignee?.emailAddress : issue.fields.creator.emailAddress),
            status: issue.fields.status.name,
            issueType: issue.fields.issuetype.name,
            labels: issue.fields?.labels
        })),
        startAt,
        maxResults,
        total
    }))
    .then(({
        issues, startAt, maxResults, total
    }) => {
        // if startAt (zero indexed) + maxResults > total, then stop and return result, else recurse to get some more results
        if (startAt + maxResults >= total) {
            // return the collected results
            return { issues };
        }
        // we need to fetch more and concatenate
        return issuesPromise(startAt + maxResults)
            .then((moreIssues) => ({ issues: issues.concat(moreIssues.issues) }));
    })
    .catch((err) => console.error(err));

export default issuesPromise;
