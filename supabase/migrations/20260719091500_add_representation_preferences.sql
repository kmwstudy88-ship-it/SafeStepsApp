alter table public.profiles
add column if not exists representation_preferences jsonb not null default '{
  "setupChoice": "choose_later",
  "culturalIdentity": "no_preference",
  "aboriginalTorresStraitIslanderRepresentation": "no_preference",
  "languagesSpoken": [],
  "parentCarerRoles": [],
  "familyStructure": "no_preference",
  "householdMembers": [],
  "preferredSkinTones": ["No preference"],
  "characterAppearance": [],
  "culturalClothingSettingsPractices": [],
  "preferPeopleFreeIllustrations": false
}'::jsonb;
