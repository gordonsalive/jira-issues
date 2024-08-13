// This code sample uses the 'node-fetch' library:
// https://www.npmjs.com/package/node-fetch
// copied from atlassian documentation here: https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-issueidorkey-changelog-get
import fetch from 'node-fetch';
import { AUTH_STRING, ORG_STRING } from './tokens.js';

// the overall return is a small header and a list of change log items in values:
// {
//     self: "https://<>.atlassian.net/rest/api/3/issue/CHO-2185/changelog?maxResults=100&startAt=0",
//     maxResults: 100,
//     startAt: 0,
//     total: 53,
//     isLast: true,
//     values: []
// }

// and the importand part is a history element for a change in field "status" like this:
// {
//     id: "19106934",
//     author: {
//         self: "https://<>.atlassian.net/rest/api/3/user?accountId=632465ef051efc6985687211",
//         accountId: "632465ef051efc6985687211",
//         emailAddress: "egebora.erguney@ocado.com",
//         avatarUrls: {
//             48x48: "https://secure.gravatar.com/avatar/3e1223b0089ea22341d7a44f8096fc66?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FEE-5.png",
//             24x24: "https://secure.gravatar.com/avatar/3e1223b0089ea22341d7a44f8096fc66?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FEE-5.png",
//             16x16: "https://secure.gravatar.com/avatar/3e1223b0089ea22341d7a44f8096fc66?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FEE-5.png",
//             32x32: "https://secure.gravatar.com/avatar/3e1223b0089ea22341d7a44f8096fc66?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FEE-5.png"
//         },
//         displayName: "Ege Bora Erguney",
//         active: true,
//         timeZone: "Europe/London",
//         accountType: "atlassian"
//     },
//     created: "2023-11-01T17:49:12.672+0000",
//     items: [
//         {
//             field: "status",
//             fieldtype: "jira",
//             fieldId: "status",
//             from: "3",
//             fromString: "In Progress",
//             to: "10118",
//             toString: "In Review"
//         }
//     ]
// },

const issueHistoryPromise = (issueKey) => fetch(
    `https://${ORG_STRING}.atlassian.net/rest/api/3/issue/${issueKey}/changelog`,
    {
        method: 'GET',
        headers: {
            // this is the API token from jira - can't see it once it has been created so if you lose it you'll need to create a new one <jiraAPItoken>
            // next I need to encode this in base64! with my email, e.g.:  echo -n user@example.com:api_token_string | base64
            // which give this <base64version>
            // and the AUTH_STRING is "Basic <base64version>"
            Authorization: AUTH_STRING, 
            Accept: 'application/json'
        }
    }
)
    .then((response) => {
        console.log(
            `Response: ${response.status} ${response.statusText}, Issue: ${issueKey}`
        );
        if (response.status === 200) {
            return response.text();
        }
        return '{}';
    })
    .then((text) => JSON.parse(text))
    .then((issueHistoryResponse) => (issueHistoryResponse.values ? issueHistoryResponse.values : []))
    .then((issueHistory) => issueHistory.filter(
        (historyItem) => historyItem.items.some((fieldItem) => fieldItem.field === 'status')
    ))
    .then((statusChangeHistory) => statusChangeHistory.map((statusChangeHistoryItem) => {
        // I want to return just: author.emailAddress, created, item[statusChange].fromString and toString
        const { author, created, items } = statusChangeHistoryItem;
        const statusChangeItem = items.find((fieldItem) => fieldItem.field === 'status');
        return {
            emailAddress: author.emailAddress,
            created,
            fromString: statusChangeItem.fromString,
            toString: statusChangeItem.toString,
        };
    }))
    .then((statusChangeSummary) => ({
        issueKey,
        statusChangeSummary
    }))
    .catch((err) => console.error(err));

export default issueHistoryPromise;
