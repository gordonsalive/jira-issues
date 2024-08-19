These stubs can be used to replace the missing files.

# tokens.js
```
// this is the API token from jira - can't see it once it has been created so if you lose it you'll need to create a new one
// <apiToken>
// next I need to encode this in base64! with my email, e.g.:  echo -n user@example.com:api_token_string | base64
// which give this
// <base64version>
// and the AUTH_STRING is "Basic <base64version>"
const AUTH_STRING = "";
const ORG_STRING = "";// take a look at the URL when accessing jira

const GITLAB_ORG_STRING = ""; // the server url, i.e. first part, of URL of repo
const repos = {
    'repo1': {id: nnnn, name: 'repo1', projectAccessToken: 'glot-asdkj983hkd'},
    'repo2': {id: nnnnn, name: 'repo2', projectAccessToken: 'glot-asdkj983hke'},
};
const filteredTeamUsername = '<team>.gl';
const filteredAuthors = ['<> Gl', 'Renovate'];


export { AUTH_STRING, ORG_STRING }
```

# sheets-config.js
The sheet UID is the one from the URL when looking at the spreadsheet
```
const sheetsConfig = {
    weeklyStatsSpreadsheet: ""
}

export default sheetsConfig;
```

# credentials.json
You'll download this (see where it is used for details)
```
{"web":{"client_id":"","project_id":"","auth_uri":"","token_uri":"","auth_provider_x509_cert_url":"","client_secret":"","redirect_uris":[""]}}
```
# config.json
```
const teams = {
    'team1': ['a@b.com', 'c@d.com'],
    'team2': ['e@f.com'],
    'other': ['banana@fruit.com'],
}
const startDate = "yyyy/mm/dd";
const teamFromAssignee = (email) => Object.keys(teams).filter(team => teams[team].includes(email))[0];

export { teams, startDate, teamFromAssignee }
```
