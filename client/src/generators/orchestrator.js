import JSZip from 'jszip';
import { ExpressGenerator } from './express/index.js';
import { NestJSGenerator } from './nestjs/index.js';

const GENERATORS = {
  express: ExpressGenerator,
  nestjs: NestJSGenerator,
};

/**
 * generateAndDownload(schema)
 * Picks the right generator, produces all files, zips them, triggers download.
 * Returns { success: boolean, error?: string }
 */
export const generateAndDownload = async (schema) => {
  // Validate schema before generation
  if (!schema.projectName?.trim()) {
    return { success: false, error: 'Project name is required' };
  }
  
  if (!schema.entities || schema.entities.length === 0) {
    return { success: false, error: 'At least one entity is required' };
  }

  // Validate entities have names
  const invalidEntities = schema.entities.filter(e => !e.name?.trim());
  if (invalidEntities.length > 0) {
    return { success: false, error: 'All entities must have names' };
  }

  const generator = GENERATORS[schema.framework];
  if (!generator) {
    return { success: false, error: `Unknown framework: ${schema.framework}` };
  }

  try {
    const files = generator.generateFiles(schema);
    
    if (!files || Object.keys(files).length === 0) {
      return { success: false, error: 'No files were generated' };
    }

    const zip = new JSZip();
    const root = zip.folder(schema.projectName);

    Object.entries(files).forEach(([path, content]) => {
      if (typeof content !== 'string') {
        console.warn(`Invalid content for file ${path}, converting to string`);
        content = String(content);
      }
      root.file(path, content);
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${schema.projectName}.zip`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return { success: true };
  } catch (err) {
    console.error('Generation error:', err);
    return { success: false, error: `Generation failed: ${err.message}` };
  }
};

/**
 * previewFiles(schema) → { [filePath]: fileContent }
 * Returns raw file map without downloading — useful for previewing output.
 */
export const previewFiles = (schema) => {
  const generator = GENERATORS[schema.framework];
  if (!generator) return {};
  return generator.generateFiles(schema);
};
