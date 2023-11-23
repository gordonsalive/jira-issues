const millisInADay = 24 * 60 * 60 * 1000;

const addCycleTime = (issuesWithStatusChanges) => {
    const calculateDuration = (statusChanges, from, to, optional = false) => {
        const hierarchy = ['Proposed', 'Prioritised', 'In Progress', 'In Review', 'In Translation', 'Merged', 'Released'];
        const recursiveSearch = (stage, backwards) => {
            // (1) Try to find this stage.  For from values (backards) find the first, else find the last
            const matchingStage = (change) => change.toString === stage;
            const statusChange = (backwards) ? statusChanges.find(matchingStage) : statusChanges.findLast(matchingStage);
            if (statusChange) {
                return statusChange;
            }

            // (2) stage doesn't exist, try again looking for an earlier stage (backwards) or a later stage
            // unless this is an optional stage, so we pass back null
            if (optional) {
                return null;
            }
            const stageIndex = hierarchy.indexOf(stage);
            if (stageIndex !== -1) {
                const nextStageIndex = (backwards) ? stageIndex - 1 : stageIndex + 1;
                if (nextStageIndex >= 0 && nextStageIndex < hierarchy.length) {
                    return recursiveSearch(hierarchy[nextStageIndex], backwards);
                }
            }

            // (3) stage does not exist in recognised hierarchy or we've recursed to the end, use first or last element
            if (backwards) {
                return statusChanges[0];
            }
            return statusChanges[statusChanges.length - 1];
        };

        if (!statusChanges || statusChanges.length === 0) {
            return 0;
        }
        const fromStage = recursiveSearch(from, true);
        const toStage = recursiveSearch(to);
        if (fromStage && toStage) {
            const fromTime = new Date(fromStage.created);
            const toTime = new Date(toStage.created);
            const durationMillis = toTime - fromTime;
            const durationDays = durationMillis / millisInADay;
            return durationDays;
        }
        // if we didn't find an optional stage, return duration of 0
        return 0;
    };

    const calculateProposedTimeUntil = (issue, index) => {
        const fromTime = new Date(issue.created);
        const toTime = new Date(issue.statusChanges[index].created);
        const durationMillis = toTime - fromTime;
        const durationDays = durationMillis / millisInADay;
        return durationDays;
    };

    // cycleTime item for each issue:
    // cycleTime: {
    //     timeUntilPrioritised: duration,  // or later
    //     timeUntilInProgress: duration, // or later
    //     timeUntilMerged: duration, // from In Progress until Merged // or later
    //     timeUntilReleased: duration,  //from merged to Released
    //     timeInReivew: duration, // time from first In Review until In Translation (or Merged) // or later
    //     timeInTranslation: duration, // time from first In Translation until Merged // or later
    //     devCycleTime: duration, // time from Prioritised until Merged // or later
    //     prodCycleTime: duration, // time from Prioritised (or later) until Released
    //     issueLeadTime: duration, // time from Proposed (or later) until Released)
    // }
    // Note the Average Lead Time for a new non expedite ticket prioritised today is average prodCycleTime * 1.5.
    // Average Lead Time for a set of stories (s), asuming a limit of n stories at the same time, is (s/n) * 1.5 * prodCycleTime
    const issuesWithStatusChangesAndCycleTimes = issuesWithStatusChanges.map((issue) => ({
        ...issue,
        cycleTime: {
            timeUntilPrioritised: calculateProposedTimeUntil(issue, 0),
            timeUntilInProgress: calculateDuration(issue.statusChanges, 'Prioritised', 'In Progress'),
            timeUntilMerged: calculateDuration(issue.statusChanges, 'In Progress', 'Merged'),
            timeUntilReleased: calculateDuration(issue.statusChanges, 'Merged', 'Released'),
            timeInReivew: calculateDuration(issue.statusChanges, 'In Review', 'In Translation', true),
            timeInTranslation: calculateDuration(issue.statusChanges, 'In Translation', 'Merged', true),
            devCycleTime: calculateDuration(issue.statusChanges, 'Prioritised', 'Merged'),
            prodCycleTime: calculateDuration(issue.statusChanges, 'Prioritised', 'Released'),
            prodLeadTime: calculateDuration(issue.statusChanges, 'In Progress', 'Released'),
            issueLeadTime: calculateProposedTimeUntil(issue, issue.statusChanges.length - 1)
        },
        closedDate: new Date(issue.statusChanges.findLast((change) => change.toString === 'Released')?.created)
    }));

    return issuesWithStatusChangesAndCycleTimes;
};

export default addCycleTime;
