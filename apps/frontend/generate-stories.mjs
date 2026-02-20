import fs from 'fs';
import path from 'path';

const componentsDir = path.join(process.cwd(), 'src/components');

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (['providers', 'SEO', 'analytics', 'tests', 'preloader'].includes(file)) continue;
      walkDir(filePath, fileList);
    } else {
      if (file.endsWith('.tsx') && !file.endsWith('.stories.tsx') && !file.endsWith('.test.tsx') && file !== 'index.tsx') {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

const componentFiles = walkDir(componentsDir);

let generatedCount = 0;

for (const fullPath of componentFiles) {
  const parsedPath = path.parse(fullPath);
  const storyPath = path.join(parsedPath.dir, `${parsedPath.name}.stories.tsx`);

  if (!fs.existsSync(storyPath)) {
    const componentName = parsedPath.name;
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Default export checks
    const hasDefaultExport = content.includes(`export default ${componentName}`) || content.includes(`export default function ${componentName}`);
    
    // Named export checks
    const exportPattern1 = new RegExp(`export\\s+(default\\s+)?(function|const|let|var|class)\\s+${componentName}\\b`);
    const exportPattern2 = new RegExp(`export\\s+\\{\\s*${componentName}\\s*\\}`);
    const exportPattern3 = new RegExp(`export\\s+default\\s+${componentName}\\b`);

    if (!exportPattern1.test(content) && !exportPattern2.test(content) && !exportPattern3.test(content) && !hasDefaultExport) {
      console.log(`Skipping ${componentName} - no matching export found`);
      continue;
    }

    const isDefault = hasDefaultExport && !exportPattern1.test(content) && !exportPattern2.test(content);
    const importStatement = isDefault 
      ? `import ${componentName} from "./${componentName}";`
      : `import { ${componentName} } from "./${componentName}";`;

    const relativePathStart = parsedPath.dir.indexOf('src/components/');
    let groupFolder = "UI";
    if (relativePathStart !== -1) {
      const folders = parsedPath.dir.substring(relativePathStart + 15).split('/');
      if (folders.length > 0 && folders[0]) {
         groupFolder = folders[0].charAt(0).toUpperCase() + folders[0].slice(1);
      }
    }

    const storyContent = `import type { Meta, StoryObj } from "@storybook/react/dist/index";
${importStatement}

/**
 * 🍍 JOLANANAS - ${componentName}
 * ==============================
 * Auto-generated Storybook file for ${componentName}.
 */
const meta: Meta<typeof ${componentName}> = {
  title: "JOLANANAS/${groupFolder}/${componentName}",
  component: ${componentName},
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ${componentName}>;

export const Default: Story = {
  args: {},
};
`;
    
    fs.writeFileSync(storyPath, storyContent);
    console.log(`Generated story for ${componentName}`);
    generatedCount++;
  }
}

console.log(`\nFinished! Generated ${generatedCount} new stories.`);
