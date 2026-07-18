const fs = require('fs');

async function run() {
  console.log("Fetching Hasaneyldrm exercises.json...");
  const hasanDataRes = await fetch("https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/data/exercises.json");
  const hasanData = await hasanDataRes.json();
  
  console.log("Fetching Yuhonas tree...");
  const yuhonasRes = await fetch("https://api.github.com/repos/yuhonas/free-exercise-db/git/trees/main?recursive=1");
  const yuhonasTree = await yuhonasRes.json();
  const yuhonasDirs = new Set(
    yuhonasTree.tree
      .filter(t => t.path.startsWith('exercises/') && t.type === 'tree')
      .map(t => t.path.split('/')[1])
  );

  // Import the current exercises array
  // Since it's ES module, we can use dynamic import
  const { default: exercises } = await import('./src/data/exercises.js');

  for (let ex of exercises) {
    // Match Hasaneyldrm
    const hasanMatch = hasanData.find(h => h.name.toLowerCase() === ex.name.toLowerCase());
    if (hasanMatch && hasanMatch.gif_url) {
      const filename = hasanMatch.gif_url.split('/').pop();
      ex.gifUrl = `https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/${filename}`;
    } else {
      ex.gifUrl = null;
    }

    // Match Yuhonas
    let formatted = ex.name.replace(/\//g, '_');
    formatted = formatted.split(/([\s-]+)/).map(word => {
      if (word.match(/^[\s-]+$/)) return word; 
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join('');
    const normName = formatted.replace(/ /g, '_');

    if (yuhonasDirs.has(normName)) {
      ex.imageUrls = [
        `https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/${normName}/0.jpg`,
        `https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/${normName}/1.jpg`
      ];
    } else {
      ex.imageUrls = [];
    }
  }

  // Write back to exercises.js
  const fileContent = `const exercises = ${JSON.stringify(exercises, null, 2)};\n\nexport default exercises;\n`;
  fs.writeFileSync('./src/data/exercises.js', fileContent);
  console.log("Done! Updated src/data/exercises.js with URLs.");
}

run().catch(console.error);
