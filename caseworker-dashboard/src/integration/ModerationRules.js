import React, { useState } from 'react';
import { addRule } from '../../integration/addRule';

export default function ModerationRules() {
  const [tier, setTier] = useState(1);
  const [phrase, setPhrase] = useState('');
  const [category, setCategory] = useState('');

  async function handleAdd() {
    await addRule(tier, phrase, category);
    alert('Rule added.');
    setPhrase('');
    setCategory('');
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Add Moderation Rule</h2>

      <label>Tier:</label>
      <select value={tier} onChange={(e) => setTier(Number(e.target.value))}>
        <option value={1}>Tier 1</option>
        <option value={2}>Tier 2</option>
        <option value={3}>Tier 3</option>
      </select>

      <br /><br />

      <label>Phrase:</label>
      <input
        value={phrase}
        onChange={(e) => setPhrase(e.target.value)}
        placeholder='e.g. it's your fault'
      />

      <br /><br />

      <label>Category:</label>
      <input
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder='e.g. blame'
      />

      <br /><br />

      <button onClick={handleAdd}>Add Rule</button>
    </div>
  );
}
