const core = require("@actions/core");
const github = require("@actions/github");

(async () => {
  const context = github.context;
  const token = core.getInput("github-token");
  const octokit = github.getOctokit(token);

  const comment = `#### Terraform Plan 📖 \`${core.getInput("plan-outcome")}\`
<details><summary>Show Plan</summary>

\`\`\`terraform
${core.getInput("plan-stdout")}
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
