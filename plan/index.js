const core = require("@actions/core");
const exec = require("@actions/exec");
const github = require("@actions/github");

const TERRAFORM_CODE_NO_PLAN_CHANGES = 0;
const TERRAFORM_CODE_PLAN_CHANGES = 2;

(async () => {
  const terraformCommand = core.getInput("cmd");
  const finalCommand = enrichCommandWithRequiredArguments(terraformCommand);

  const { exitCode, stdout } = await exec.getExecOutput(finalCommand, null, {
    cwd: core.getInput("working-directory"),
    ignoreReturnCode: true,
  });

  console.log(`Exit code was ${exitCode}, type: ${typeof exitCode}`);

  if (exitCode === TERRAFORM_CODE_PLAN_CHANGES) {
    await createComment(stdout);
  }

  if (exitCode !== TERRAFORM_CODE_NO_PLAN_CHANGES) {
    core.setFailed("terraform plan failed");
  }
})();

function enrichCommandWithRequiredArguments(cmd) {
  if (!cmd.includes(" -no-color")) {
    cmd += " -no-color";
  }
  if (!cmd.includes(" -detailed-exitcode")) {
    cmd += " -detailed-exitcode";
  }
  return cmd;
}

async function createComment(plan) {
  const context = github.context;
  const token = core.getInput("github-token");
  const octokit = github.getOctokit(token);

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
}

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
