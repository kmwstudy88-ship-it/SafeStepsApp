# ================================================
# SAFE STEPS CURRICULUM ENGINE v1
# PART 3 of 10 — Build topic list
# ================================================

Write-Host "=== PART 3: Building topic list ===" -ForegroundColor Cyan

# In Option A, TopicsIndex is already the topic list.
$topicCount = $Global:TopicsIndex.Keys.Count
Write-Host "PART 3 complete: Found $topicCount topics." -ForegroundColor Green
$Global:ProcessingReport += "Identified $topicCount topics from topic folders."
