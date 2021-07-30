const core = require("@actions/core");
const github = require("@actions/github");

(async () => {
  const context = github.context;
  const token = core.getInput("github-token");
  const octokit = github.getOctokit(token);

  const outcome = core.getInput("plan-outcome");
  const plan = core.getInput("plan-stdout");

  const summaryMatches = plan.match(/.*\d to add, \d to change, \d to destroy/);
  const summary = summaryMatches
    ? `${summaryMatches[0]} -`
    : "Changes identified!";

  const formattedOutcome = outcome ? "`" + outcome + "`" : null;
  const comment = `#### Terraform Plan 📖 ${formattedOutcome || ""}
<details><summary>${summary} Show Plan</summary>

\`\`\`terraform
${plan}
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
