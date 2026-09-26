When using GitHub Copilot coding agent features in this repository:

- Do not request deprecated or retired models.
- For agent, task, or background-task model selection, prefer the default `auto` choice unless a currently supported model is required for a specific reason.
- If an explicit model is necessary, choose only from the models currently exposed by the active tool/runtime instead of reusing older session defaults.
- If a resumed session, saved plan, prior instruction, or carried-forward agent/task model parameter references a retired or unavailable explicit model choice, discard that explicit override before any new turn or tool call, clear any inherited model argument fields, and continue with `auto`; never reuse an inherited explicit model name unless you re-select it from the models currently exposed by the active runtime.
- Never carry forward historical model overrides into new runs; start each run from `auto` unless the current runtime explicitly supports and requires a different model.
