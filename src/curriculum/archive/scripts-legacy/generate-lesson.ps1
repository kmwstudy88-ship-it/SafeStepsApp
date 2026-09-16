param(
  [string],
  [string],
  [int]
)

 = ".\data\programs\\module"
New-Item -ItemType Directory -Force -Path  | Out-Null

 = "\day_.json"

 = @"
{
  "id": "_day_",
  "title": "Lesson Title",
  "microLesson": [
    { "type": "paragraph", "text": "Content here" }
  ],
  "reflectionPrompt": [
    { "type": "paragraph", "text": "Reflection here" }
  ],
  "actionTask": [
    { "type": "paragraph", "text": "Action here" }
  ]
}
