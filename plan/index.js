const core = require("@actions/core");
const exec = require("@actions/exec");
const github = require("@actions/github");

(async () => {
  const terraformCommand = core.getInput("cmd");
  const finalCommand = enrichCommandWithRequiredArguments(terraformCommand);

  const { exitCode, output } = await sh(finalCommand, {
    cwd: core.getInput("working-directory"),
  });

  if (exitCode === 2) {
    await createComment(output);
  }

  if (exitCode === 1) {
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

async function sh(command, options) {
  let output = "";
  const exitCode = await exec.exec(command, undefined, {
    ...options,
    listeners: {
      stdout: (data) => {
        output += data;
      },
      stderr: (data) => {
        output += data;
      },
    },
  });

  return { exitCode, output };
}
