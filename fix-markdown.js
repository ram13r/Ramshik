import Database from "better-sqlite3";

const db = new Database("ramshika.db");
const rows = db.prepare("SELECT id, content FROM blogs").all();

rows.forEach((row) => {
  if (row.content.includes("##") || row.content.includes("**")) {
    let html = row.content;
    
    // Strip existing HTML tags to avoid double encoding if it was mixed
    html = html.replace(/<[^>]*>?/gm, '');

    html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
    html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
    html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");
    html = html.replace(/^\> (.*$)/gim, "<blockquote>$1</blockquote>");
    html = html.replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>");
    html = html.replace(/\*(.*?)\*/gim, "<em>$1</em>");
    
    html = html.replace(/^\- (.*$)/gim, "<ul><li>$1</li></ul>");

    html = html.split('\n').map(line => line.trim()).filter(line => line.length > 0).join('\n\n');

    html = html.split('\n\n').map(p => {
      p = p.trim();
      if (!p) return "";
      if (p.startsWith("<h") || p.startsWith("<blockquote") || p.startsWith("<ul")) return p;
      p = p.replace(/\n/g, "<br/>\n");
      return `<p>${p}</p>`;
    }).join("\n");

    db.prepare("UPDATE blogs SET content = ? WHERE id = ?").run(html, row.id);
    console.log("Fixed blog id: " + row.id);
  }
});
