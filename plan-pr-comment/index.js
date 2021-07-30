const core = require("@actions/core");
const github = require("@actions/github");

(async () => {
  const context = github.context;
  const token = core.getInput("github-token");
  const octokit = github.getOctokit(token);

  const outcome = core.getInput("plan-outcome");
  const plan = core.getInput("plan-stdout");

  const comment = `#### Terraform Plan 📖 ${formatOutcome(outcome)}
<details><summary>${extractSummary(plan)} Show Plan</summary>

\`\`\`terraform
${importantPartOfPlan(plan)}
\`\`\`

</details>
`;

  await octokit.rest.issues.createComment({
    issue_number: context.issue.number,
    owner: context.repo.owner,
    repo: context.repo.repo,
    body: comment,
  });
})();

function extractSummary(plan) {
  const summaryMatches = plan.match(/.*\d to add, \d to change, \d to destroy/);
  return summaryMatches ? `${summaryMatches[0]} -` : "Changes identified!";
}

function importantPartOfPlan(plan) {
  const positionOfImportantPart = plan.indexOf(
    "An execution plan has been generated and is shown below."
  );

  return positionOfImportantPart > 0
    ? plan.substring(positionOfImportantPart)
    : plan;
}

function formatOutcome(outcome) {
  return outcome ? "`" + outcome + "`" : "";
}
