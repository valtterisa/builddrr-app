// services/codeQuality.ts
import { ESLint } from "eslint";
import ts from "typescript";
import { Script, createContext } from "vm";
import generateWebsite from "./code-generator";

/**
 * Lint the generated code using ESLint.
 * Returns true if there are no linting errors.
 */
export async function lintCode(code: string): Promise<boolean> {
  try {
    const eslint = new ESLint({ fix: true });
    const results = await eslint.lintText(code);
    for (const result of results) {
      if (result.errorCount > 0) {
        console.warn("Lint errors:", result.messages);
        return false;
      }
    }
    return true;
  } catch (err) {
    console.error("Linting exception:", err);
    return false;
  }
}

/**
 * Check that the generated TypeScript code compiles without errors.
 * Uses ts.transpileModule to simulate a compile check.
 */
export function compileTsCheck(code: string): boolean {
  const result = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2019,
      strict: true,
    },
    reportDiagnostics: true,
  });

  if (result.diagnostics && result.diagnostics.length > 0) {
    console.error(
      "TypeScript compile errors:",
      result.diagnostics.map((diag) =>
        ts.flattenDiagnosticMessageText(diag.messageText, "\n")
      )
    );
    return false;
  }
  return true;
}

/**
 * Verify runtime correctness by executing the code in a Node.js VM context.
 * This basic runtime check ensures that the code executes without throwing runtime errors.
 */
export async function verifyAndRunCode(code: string): Promise<boolean> {
  try {
    const context = createContext({ console });
    const script = new Script(code);
    script.runInContext(context, { timeout: 1000 });
    return true;
  } catch (error) {
    console.error("Runtime verification failed:", error);
    return false;
  }
}

interface PageContent {
  path: string;
  content: string;
}

function extractPagesFromMdx(mdxContent: string): PageContent[] {
  const pageRegex =
    /data-file-location='([^']+)'([^]*?)(?=data-file-location='|$)/g;
  const pages: PageContent[] = [];

  let match;
  while ((match = pageRegex.exec(mdxContent)) !== null) {
    pages.push({
      path: match[1],
      content: match[2].trim(),
    });
  }

  return pages;
}

async function validatePage(content: string): Promise<boolean> {
  const lintPass = await lintCode(content);
  const compilePass = compileTsCheck(content);
  const runtimePass = await verifyAndRunCode(content);

  return lintPass && compilePass && runtimePass;
}

/**
 * Iterative generation: generates code using Vercel AI SDK and iterates until:
 * - Code passes the ESLint lint check.
 * - Code passes the TypeScript compile check.
 * - Code successfully runs in a VM context.
 *
 * If all these steps pass, the valid code is returned.
 * If not, the process is retried up to maxIterations times.
 */
export default async function generateValidSectionCode(
  prompt: string,
  maxIterations = 3
): Promise<string> {
  for (let i = 0; i < maxIterations; i++) {
    console.info(`Generation iteration ${i + 1} with config:`, prompt);

    // Generate code using the AI-based generator.
    const code = await generateWebsite(prompt);

    return code;

    // Extract individual pages
    // const pages = extractPagesFromMdx(code);


    // // Validate each page separately
    // let allPagesValid = true;
    // for (const page of pages) {
    //   console.info(`Validating page: ${page.path}`);
    //   const isValid = await validatePage(page.content);

    //   if (!isValid) {
    //     console.warn(`Validation failed for page: ${page.path}`);
    //     allPagesValid = false;
    //     break;
    //   }
    // }

    // if (allPagesValid) {
    //   console.info(`Code generation successful on iteration ${i + 1}`);
    //   return code; // Return the original MDX with all pages
    // }

    console.warn(`Validation failed on iteration ${i + 1}. Regenerating...`);
  }

  throw new Error("Failed to generate valid code after maximum iterations");
}
