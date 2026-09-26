When using GitHub Copilot coding agent features in this repository:

- Do not request deprecated or retired models.
- For agent, task, or background-task model selection, prefer the default `auto` choice unless a currently supported model is required for a specific reason.
- If an explicit model is necessary, choose only from the models currently exposed by the active tool/runtime instead of reusing older session defaults.
- If a resumed session, saved plan, prior instruction, or carried-forward agent/task model parameter references a retired or unavailable explicit model choice, clear it and continue with `auto` or another currently supported runtime model.
