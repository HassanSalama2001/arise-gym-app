const fs = require('fs');

async function run() {
  console.log("Fetching Hasaneyldrm tree...");
  const hasanRes = await fetch("https://api.github.com/repos/hasaneyldrm/exercises-dataset/git/trees/main?recursive=1");
  const hasanTree = await hasanRes.json();
  const hasanGifs = hasanTree.tree.filter(t => t.path.startsWith('videos/') && t.path.endsWith('.gif')).map(t => t.path);

  console.log("Fetching Yuhonas tree...");
  const yuhonasRes = await fetch("https://api.github.com/repos/yuhonas/free-exercise-db/git/trees/main?recursive=1");
  const yuhonasTree = await yuhonasRes.json();
  const yuhonasDirs = new Set(
    yuhonasTree.tree
      .filter(t => t.path.startsWith('exercises/') && t.type === 'tree')
      .map(t => t.path.split('/')[1])
  );

  const exercises = JSON.parse(fs.readFileSync('./src/data/exercises.json', 'utf8'));

  for (let ex of exercises) {
    // 1. Fix Hasaneyldrm GIF URL
    if (ex.videoUri) {
      // Find the filename, e.g. "0001-2gPfomN.gif"
      const filename = ex.videoUri.split('/').pop();
      // Verify it exists in hasanTree
      const exists = hasanGifs.find(p => p.endsWith(filename));
      if (exists) {
        ex.gifUrl = `https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/${exists}`;
      } else {
        ex.gifUrl = `https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/${filename}`; // fallback just in case
      }
    }
    // Delete the old videoUri to clean up
    delete ex.videoUri;

    // 2. Map Yuhonas Images
    // Our formatter logic
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

  fs.writeFileSync('./src/data/exercises.json', JSON.stringify(exercises, null, 2));
  console.log("Done! Updated exercises.json.");
}

run().catch(console.error);
