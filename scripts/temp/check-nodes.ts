import { listCurriculumTree } from "../../lib/curriculum-portal";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function check() {
  const tree = await listCurriculumTree();
  console.log("Total nodes at root:", tree.length);
  const science = tree.find(n => n.nodeType === "subject" && n.title === "Science");
  if (!science) {
    console.log("No Science subject found");
    return;
  }
  const cells = science.children.find(c => c.title === "Cells");
  if (!cells) {
    console.log("No Cells chapter found");
    return;
  }
  const observing = cells.children.find(c => c.title === "Observing cells");
  if (!observing) {
    console.log("No Observing cells lesson found");
    return;
  }
  console.log("Found Observing Cells:", observing.id);
}

check().then(() => process.exit(0)).catch(console.error);
