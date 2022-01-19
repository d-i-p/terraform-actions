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

      - name: Run terraform plan
        uses: d-i-p/terraform-actions/plan@main
        with:
          cmd: terraform plan -var=image=${{ steps.current-task-definition.outputs.image }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          working-directory: infrastructure
```
