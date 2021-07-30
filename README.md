# terraform-actions

Several github actions to simplify working with terraform in github action workflows.

**Please note that this repository is public so it can be accessed by github actions**

## Example

Run terraform plan in a pull request and add the plan output as a comment to the PR.

```
jobs:
  plan:
    steps:
      - uses: d-i-p/terraform-actions/current-ecs-task-definition@main
        id: current-task-definition
        with:
          name: ${{ env.PROJECT_NAME }}

      - name: Terraform plan
        id: plan
        run: terraform plan -no-color -detailed-exitcode -var=image=${{ steps.current-task-definition.outputs.image }}
        continue-on-error: true

      - name: Add PR comment if plan has changes
        if: steps.plan.outputs.exitcode == 2
        uses: d-i-p/terraform-actions/plan-pr-comment@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          plan-stdout: ${{ steps.plan.outputs.stdout }}

      - name: Exit if terraform plan failed
        if: steps.plan.outputs.exitcode == 1
        run: exit 1
```
