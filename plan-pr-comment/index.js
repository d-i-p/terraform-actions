const core = require("@actions/core");
const github = require("@actions/github");

(async () => {
  const context = github.context;
  const token = core.getInput("github-token");
  const octokit = github.getOctokit(token);

  const plan = core.getInput("plan-stdout");

  const comment = `#### Terraform Plan 📖
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
  const summaryMatches = plan.match(/.*\d+ to add, \d+ to change, \d+ to destroy/);
  return summaryMatches ? `${summaryMatches[0]} -` : "Changes identified!";
}

function importantPartOfPlan(plan) {
  // terraform 0.x output
  let positionOfImportantPart = plan.indexOf(
    "An execution plan has been generated and is shown below."
  );

  // terraform 1.x output
  if (positionOfImportantPart === -1) {
    positionOfImportantPart = plan.indexOf(
      'Terraform used the selected providers to generate the following execution'
    );
  }

  return positionOfImportantPart > 0
    ? plan.substring(positionOfImportantPart)
    : plan;
}
