When using GitHub Copilot coding agent features in this repository:

- Do not request deprecated or retired models such as `claude-sonnet-4.6` or `claude-sonnet-4-6`.
- For agent, task, or background-task model selection, prefer the default `auto` choice unless a currently supported model is required for a specific reason.
- If an explicit model is necessary, choose only from the models currently exposed by the active tool/runtime instead of reusing older session defaults.
