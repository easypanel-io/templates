import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { readFile, writeFile } from "fs/promises";
import glob from "glob";
import YAML from "yaml";
import { z } from "zod";

// Organized tags by category for better AI understanding
const tags = [
    // Core Infrastructure & Hosting
    "Self-Hosting",
    "Docker",
    "Database",
    "Cloud",
    "VPN",
    "Monitoring",
    
    // Development & DevOps
    "Developer Tools",
    "AI",
    "No-Code",
    "Automation",
    "Analytics",
    
    // Business Applications
    "CRM",
    "ERP",
    "Productivity",
    "Collaboration",
    "Task Management",
    "Documentation",
    
    // Content & Media
    "Media",
    "Notes",
    "Wiki",
    "Email",
    "Chat",
    
    // Security & Privacy
    "Security",
    "Privacy",
    
    // Specialized
    "IoT",
    "Torrent",
    "Tracking",
    "Gaming",
    
    // Content Management & Web
    "CMS",
    "Website Builder",
    "Blogging",
    "eCommerce",
    
    // Data & Analytics
    "Data Science",
    "Business Intelligence",
    "Visualization",
    
    // Communication
    "Video Conferencing",
    "Social Media",
    "Forums",
    
    // File Management
    "File Storage",
    "Backup",
    "Sync",
    
    // Entertainment
    "Streaming",
    "Music",
    "Photos",
    "Books",
    
    // Finance & Accounting
    "Finance",
    "Accounting",
    "Invoicing",
    
    // Project Management
    "Project Management",
    "Time Tracking",
    "Issue Tracking",
    
    // Learning & Education
    "Education",
    "Training",
    "Knowledge Base",
]

const tagsSchema = z.object({
    tags: z.array(z.enum(tags as [string, ...string[]])),
});

// For OpenAI models
// process.env.OPENAI_API_KEY = "YOUR_API_KEY";

// For Google models
process.env.GOOGLE_GENERATIVE_AI_API_KEY = "YOUR_API_KEY";


async function run() {
    const items = glob
      .sync("./templates/*/meta.yaml")
      .map((item) => item.slice(12, -9));
  
    console.log(`Processing ${items.length} templates...`);
    
    for (const item of items) {
      try {
        const fileContent = await readFile(
          `./templates/${item}/meta.yaml`,
          "utf-8"
        );
    
        const meta = YAML.parse(fileContent);

        console.log(`\nProcessing: ${meta.name}`);
        console.log(`Current tags: ${meta.tags || 'none'}`);


        const links = meta.links?.map((link: {url: string}) => link.url).join(', ') || '';

        const systemGuide = `
        You are an expert at categorizing self-hosted applications for a server control panel called Easypanel.
        
        Your task is to analyze open-source application templates and assign the most relevant tags to help users find them quickly.
        
        CRITICAL RULES:
        1. You MUST ONLY use tags from this EXACT list: ${tags.join(", ")}
        2. Do NOT create new tags or use variations
        3. Select 1-4 most relevant tags that best describe the PRIMARY purpose and category
        4. Consider what users would search for when looking for this type of application
        5. Prioritize the main function over secondary features
        
        Context: These are self-hosted applications that users deploy on their own servers. Focus on:
        - Primary use case and target audience
        - Main functionality and purpose
        - Industry or domain it serves
        `;

        const prompt = `
        Application: ${meta.name}
        Description: ${meta.description}

        ${links ? `Related URLs: ${links}` : ''}
        
        Based on this information, what are the most relevant tags for users searching for this type of application?
        `;

        // For OpenAI models
        // const result = await generateObject({
        //   model: openai('gpt-4o-mini'),
        //   system: systemGuide,
        //   prompt,
        //   schema: tagsSchema,
        //   maxRetries: 10,
        //   temperature: 0.1,
        // });

        // For Google models
         const result = await generateObject({
          model: google('gemini-2.5-flash-preview-05-20'),
          system: systemGuide,
          prompt,
          schema: tagsSchema,
          maxRetries: 10,
          temperature: 0.1,
        });

        const resultTags = result.object.tags;

        console.log(`Generated tags: ${resultTags.join(', ')}`);
        meta.tags = resultTags;

        await writeFile(`./templates/${item}/meta.yaml`, YAML.stringify(meta));
        console.log(`========== Updated ${meta.name} ==========`);       
      } catch (error) {
        console.error(`========== Failed to process ${item}: ==========`, error);
      }
    }

    console.log(`\n🎉 Finished processing ${items.length} templates`);
  }
 
run().catch(console.error);
  