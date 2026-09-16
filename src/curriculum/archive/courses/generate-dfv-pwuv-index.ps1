$index = @'
{
  "stream": "dfv-pwuv",
  "version": "1.1.0",
  "title": "DFV – People Who Use Violence",
  "description": "A 20‑topic behaviour‑change program supporting participants to understand, reduce, and stop the use of domestic and family violence.",
  "topics": [
    { "slug": "accountability", "title": "Accountability", "path": "accountability" },
    { "slug": "responsibility", "title": "Responsibility", "path": "responsibility" },
    { "slug": "understanding-coercive-control", "title": "Understanding Coercive Control", "path": "understanding-coercive-control" },
    { "slug": "effects-on-children", "title": "Effects on Children", "path": "effects-on-children" },
    { "slug": "effects-on-partners", "title": "Effects on Partners", "path": "effects-on-partners" },

    { "slug": "respectful-relationships", "title": "Respectful Relationships", "path": "respectful-relationships" },
    { "slug": "healthy-communication", "title": "Healthy Communication", "path": "healthy-communication" },
    { "slug": "emotional-regulation", "title": "Emotional Regulation", "path": "emotional-regulation" },
    { "slug": "managing-anger", "title": "Managing Anger", "path": "managing-anger" },
    { "slug": "conflict-resolution", "title": "Conflict Resolution", "path": "conflict-resolution" },

    { "slug": "self-reflection", "title": "Self‑Reflection", "path": "self-reflection" },
    { "slug": "triggers-and-patterns", "title": "Triggers and Patterns", "path": "triggers-and-patterns" },
    { "slug": "behaviour-change", "title": "Behaviour Change", "path": "behaviour-change" },
    { "slug": "ongoing-accountability", "title": "Ongoing Accountability", "path": "ongoing-accountability" },
    { "slug": "long-term-change", "title": "Long‑Term Change", "path": "long-term-change" },

    { "slug": "rebuilding-trust", "title": "Rebuilding Trust", "path": "rebuilding-trust" },
    { "slug": "repairing-relationships", "title": "Repairing Relationships", "path": "repairing-relationships" },
    { "slug": "safety-planning-for-change", "title": "Safety Planning for Change", "path": "safety-planning-for-change" },
    { "slug": "parenting-without-fear", "title": "Parenting Without Fear", "path": "parenting-without-fear" },
    { "slug": "relapse-prevention", "title": "Relapse Prevention", "path": "relapse-prevention" }
  ]
}
'@

$index | Out-File -FilePath "dfv-pwuv-index.json" -Encoding UTF8 -Force

Write-Host "DFV PWUV Index created."
