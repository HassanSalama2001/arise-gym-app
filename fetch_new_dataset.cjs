const fs = require('fs');
const https = require('https');

const RAW_URL = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/data/exercises.json';

https.get(RAW_URL, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      
      const mapped = data.map(ex => {
        return {
          id: parseInt(ex.id, 10),
          name: ex.name,
          category: ex.category || ex.body_part,
          muscleGroup: ex.body_part || ex.target,
          equipment: ex.equipment,
          target: ex.target,
          secondaryMuscles: ex.secondary_muscles || [],
          instructions: ex.instruction_steps?.en || [ex.instructions?.en].filter(Boolean),
          gifUrl: `https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/${ex.gif_url}`
        };
      });

      const output = `// Auto-generated from hasaneyldrm dataset
// Total exercises: ${mapped.length}

export const exercises = ${JSON.stringify(mapped, null, 2)};
`;

      fs.writeFileSync('./src/data/exercises.js', output, 'utf8');
      console.log(`Successfully wrote ${mapped.length} exercises to src/data/exercises.js`);
    } catch (e) {
      console.error('Error parsing JSON:', e);
    }
  });
}).on('error', e => {
  console.error('Error fetching data:', e);
});
