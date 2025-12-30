#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Accessibility rules configuration
const ACCESSIBILITY_RULES = [
  {
    id: 'img-alt',
    name: 'Image Alt Text',
    description: 'All <img> tags must have alt attributes',
    pattern: '<img[^>]*>',
    excludePattern: 'alt=',
    severity: 'error',
    fileTypes: ['html'],
    wcagLevel: 'A',
    wcagCriteria: '1.1.1 Non-text Content',
    howToFix: 'Add alt attribute to img tag',
    fixExample: '<img src="logo.png" alt="Company logo">',
    autoFixable: true
  },
  {
    id: 'interactive-icon-tabindex',
    name: 'Interactive Icon Tabindex',
    description: 'Interactive mat-icons with (click) must have tabindex',
    pattern: '<mat-icon[^>]*(click)=',
    excludePattern: 'tabindex=',
    severity: 'error',
    fileTypes: ['html'],
    wcagLevel: 'A',
    wcagCriteria: '2.1.1 Keyboard',
    howToFix: 'Add tabindex="0", role="button", keyboard handlers, and aria-label',
    fixExample: '<mat-icon (click)="delete()" (keydown.enter)="delete()" (keydown.space)="delete(); $event.preventDefault()" tabindex="0" role="button" aria-hidden="false" [attr.aria-label]="\'Delete item\'">delete</mat-icon>',
    autoFixable: false
  },
  {
    id: 'interactive-icon-role',
    name: 'Interactive Icon Role',
    description: 'Interactive mat-icons with (click) must have role="button"',
    pattern: '<mat-icon[^>]*(click)=',
    excludePattern: 'role=',
    severity: 'error',
    fileTypes: ['html'],
    wcagLevel: 'A',
    wcagCriteria: '4.1.2 Name, Role, Value',
    howToFix: 'Add role="button" to interactive mat-icon',
    fixExample: '<mat-icon (click)="action()" role="button" tabindex="0" [attr.aria-label]="\'Action\'">icon</mat-icon>',
    autoFixable: false
  },
  {
    id: 'interactive-icon-aria-label',
    name: 'Interactive Icon ARIA Label',
    description: 'Interactive mat-icons with (click) must have aria-label or [attr.aria-label]',
    pattern: '<mat-icon[^>]*(click)=',
    excludePattern: '(aria-label=|\\[attr\\.aria-label\\])',
    severity: 'error',
    fileTypes: ['html'],
    wcagLevel: 'A',
    wcagCriteria: '4.1.2 Name, Role, Value',
    howToFix: 'Add [attr.aria-label] with descriptive text (preferred) or aria-label',
    fixExample: '<mat-icon (click)="delete()" [attr.aria-label]="\'Delete item\'">delete</mat-icon>',
    autoFixable: false
  },
  {
    id: 'button-without-text-aria-label',
    name: 'Button Without Text ARIA Label',
    description: 'Icon-only buttons must have aria-label or [attr.aria-label]',
    pattern: '<button[^>]*mat-icon-button',
    excludePattern: '(aria-label=|\\[attr\\.aria-label\\])',
    severity: 'error',
    fileTypes: ['html'],
    wcagLevel: 'A',
    wcagCriteria: '4.1.2 Name, Role, Value',
    howToFix: 'Add [attr.aria-label] with descriptive action text',
    fixExample: '<button mat-icon-button [attr.aria-label]="\'Delete item\'"><mat-icon aria-hidden="true">delete</mat-icon></button>',
    autoFixable: false
  },
  {
    id: 'link-click-keyboard',
    name: 'Link Click Keyboard Support',
    description: 'Links with (click) handlers must have keyboard support (keydown.enter)',
    pattern: '<a[^>]*(click)=',
    excludePattern: '(routerLink|keydown\\.enter)',
    severity: 'error',
    fileTypes: ['html'],
    wcagLevel: 'A',
    wcagCriteria: '2.1.1 Keyboard',
    howToFix: 'Add keyboard event handlers (keydown.enter and keydown.space) and role="button"',
    fixExample: '<a (click)="method()" (keydown.enter)="method()" (keydown.space)="method(); $event.preventDefault()" tabindex="0" role="button" aria-label="Action">Link</a>',
    autoFixable: false
  },
  {
    id: 'span-click-keyboard',
    name: 'Span Click Keyboard Support',
    description: 'Interactive spans with (click) must have keyboard support',
    pattern: '<span[^>]*(click)=',
    excludePattern: 'keydown\\.enter',
    severity: 'error',
    fileTypes: ['html'],
    wcagLevel: 'A',
    wcagCriteria: '2.1.1 Keyboard',
    howToFix: 'Add keyboard event handlers, tabindex, and role="button"',
    fixExample: '<span (click)="method()" (keydown.enter)="method()" (keydown.space)="method(); $event.preventDefault()" tabindex="0" role="button">Text</span>',
    autoFixable: false
  },
  {
    id: 'color-contrast',
    name: 'Color Contrast',
    description: 'Replace #228189 with #1a6269 for better contrast',
    pattern: '#228189',
    excludePattern: null,
    severity: 'warning',
    fileTypes: ['html', 'scss', 'css'],
    wcagLevel: 'AA',
    wcagCriteria: '1.4.3 Contrast (Minimum)',
    howToFix: 'Replace #228189 with #1a6269 for 4.8:1 contrast ratio',
    fixExample: 'color: #1a6269; /* Was: #228189 */',
    autoFixable: true
  },
  {
    id: 'invalid-nesting',
    name: 'Invalid HTML Nesting',
    description: 'Never nest <a> inside <button>',
    pattern: '<button[^>]*>.*<a',
    excludePattern: null,
    severity: 'error',
    fileTypes: ['html'],
    wcagLevel: 'A',
    wcagCriteria: '4.1.1 Parsing',
    howToFix: 'Separate button and link, or use only button for actions and only link for navigation',
    fixExample: '<button (click)="action()"><mat-icon aria-hidden="true">icon</mat-icon><span>Action</span></button>',
    autoFixable: false
  },
  {
    id: 'svg-role',
    name: 'SVG Accessibility',
    description: 'SVG elements must have role="img" or aria-hidden="true"',
    pattern: '<svg',
    excludePattern: '(role=|aria-hidden=)',
    severity: 'warning',
    fileTypes: ['html'],
    wcagLevel: 'A',
    wcagCriteria: '1.1.1 Non-text Content',
    howToFix: 'Add role="img" with aria-label for meaningful SVGs, or aria-hidden="true" for decorative',
    fixExample: '<svg role="img" aria-label="Company logo"><title>Company logo</title>...</svg>',
    autoFixable: false
  },
  {
    id: 'focusable-aria-hidden',
    name: 'Focusable with aria-hidden',
    description: 'CRITICAL: Focusable elements (tabindex="0") must not have aria-hidden="true"',
    pattern: 'tabindex="0"[^>]*aria-hidden="true"|aria-hidden="true"[^>]*tabindex="0"',
    excludePattern: null,
    severity: 'error',
    fileTypes: ['html'],
    wcagLevel: 'A',
    wcagCriteria: '4.1.2 Name, Role, Value',
    howToFix: 'Remove aria-hidden="true" or change to aria-hidden="false" on focusable elements',
    fixExample: '<mat-icon tabindex="0" role="button" aria-hidden="false" [attr.aria-label]="\'Action\'">icon</mat-icon>',
    autoFixable: false
  },
  {
    id: 'loading-spinner-role',
    name: 'Loading Indicator Accessibility',
    description: 'Loading indicators must have role="status" and aria-live="polite"',
    pattern: '<mat-spinner',
    excludePattern: 'role="status"',
    severity: 'warning',
    fileTypes: ['html'],
    wcagLevel: 'A',
    wcagCriteria: '4.1.3 Status Messages',
    howToFix: 'Wrap spinner in container with role="status", aria-live="polite", aria-busy="true", and visually-hidden text',
    fixExample: '<div role="status" aria-live="polite" aria-busy="true"><mat-spinner aria-label="Loading"></mat-spinner><span class="visually-hidden">Loading, please wait...</span></div>',
    autoFixable: false
  },
  {
    id: 'plain-aria-label',
    name: 'Angular Attribute Binding',
    description: 'Use [attr.aria-label] instead of plain aria-label in Angular',
    pattern: 'aria-label="',
    excludePattern: '\\[attr\\.aria-label\\]',
    severity: 'warning',
    fileTypes: ['html'],
    wcagLevel: 'Best Practice',
    wcagCriteria: 'Angular Best Practice',
    howToFix: 'Replace aria-label="text" with [attr.aria-label]="\'text\'"',
    fixExample: '<button [attr.aria-label]="\'Delete item\'">Delete</button>',
    autoFixable: true
  }
];

// Get all files matching the pattern
function getFiles(dir, fileTypes, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, dist, and hidden directories
      if (!item.startsWith('.') && item !== 'node_modules' && item !== 'dist') {
        getFiles(fullPath, fileTypes, files);
      }
    } else {
      const ext = path.extname(item).substring(1);
      if (fileTypes.includes(ext)) {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

// Check a single rule against file content
function checkRule(rule, filePath, fileContent) {
  const issues = [];
  const lines = fileContent.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;
    
    // Check if pattern matches
    const patternRegex = new RegExp(rule.pattern, 'i');
    if (patternRegex.test(line)) {
      // Check if exclude pattern is present
      if (rule.excludePattern) {
        const excludeRegex = new RegExp(rule.excludePattern, 'i');
        if (!excludeRegex.test(line)) {
          issues.push({
            rule: rule.id,
            name: rule.name,
            description: rule.description,
            severity: rule.severity,
            file: filePath,
            line: lineNumber,
            content: line.trim(),
            wcagLevel: rule.wcagLevel,
            wcagCriteria: rule.wcagCriteria,
            howToFix: rule.howToFix,
            fixExample: rule.fixExample,
            autoFixable: rule.autoFixable
          });
        }
      } else {
        issues.push({
          rule: rule.id,
          name: rule.name,
          description: rule.description,
          severity: rule.severity,
          file: filePath,
          line: lineNumber,
          content: line.trim(),
          wcagLevel: rule.wcagLevel,
          wcagCriteria: rule.wcagCriteria
        });
      }
    }
  }
  
  return issues;
}

// Run accessibility checks
function runAccessibilityChecks(srcDir = 'src') {
  console.log('🔍 Running Accessibility Checks...\n');
  
  const allIssues = [];
  const issuesByRule = {};
  
  // Process each rule
  for (const rule of ACCESSIBILITY_RULES) {
    const files = getFiles(srcDir, rule.fileTypes);
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const issues = checkRule(rule, file, content);
      
      if (issues.length > 0) {
        allIssues.push(...issues);
        
        if (!issuesByRule[rule.id]) {
          issuesByRule[rule.id] = {
            rule: rule,
            issues: []
          };
        }
        issuesByRule[rule.id].issues.push(...issues);
      }
    }
  }
  
  return { allIssues, issuesByRule };
}

// Generate report
function generateReport(results) {
  const { allIssues, issuesByRule } = results;
  
  let report = '# 🔍 Accessibility Check Results\n\n';
  
  if (allIssues.length === 0) {
    report += '✅ **No accessibility issues found!**\n\n';
    return report;
  }
  
  // Summary
  const errorCount = allIssues.filter(i => i.severity === 'error').length;
  const warningCount = allIssues.filter(i => i.severity === 'warning').length;
  
  report += `## Summary\n\n`;
  report += `- ❌ **Errors**: ${errorCount}\n`;
  report += `- ⚠️ **Warnings**: ${warningCount}\n`;
  report += `- 📊 **Total Issues**: ${allIssues.length}\n\n`;
  report += `---\n\n`;
  
  // Issues by rule
  for (const [ruleId, data] of Object.entries(issuesByRule)) {
    const icon = data.rule.severity === 'error' ? '❌' : '⚠️';
    report += `## ${icon} ${data.rule.name}\n\n`;
    report += `**Description**: ${data.rule.description}\n\n`;
    report += `**How to Fix**: ${data.rule.howToFix}\n\n`;
    report += `**Fix Example**:\n\`\`\`html\n${data.rule.fixExample}\n\`\`\`\n\n`;
    if (data.rule.autoFixable) {
      report += `✨ **Auto-fixable**: This issue can be automatically fixed by Copilot\n\n`;
    }
    report += `**WCAG**: ${data.rule.wcagLevel} - ${data.rule.wcagCriteria}\n\n`;
    report += `**Issues Found**: ${data.issues.length}\n\n`;
    
    // Group by file
    const issuesByFile = {};
    for (const issue of data.issues) {
      if (!issuesByFile[issue.file]) {
        issuesByFile[issue.file] = [];
      }
      issuesByFile[issue.file].push(issue);
    }
    
    for (const [file, fileIssues] of Object.entries(issuesByFile)) {
      report += `### 📄 \`${file}\`\n\n`;
      for (const issue of fileIssues) {
        report += `- Line ${issue.line}: \`${issue.content.substring(0, 100)}${issue.content.length > 100 ? '...' : ''}\`\n`;
      }
      report += `\n`;
    }
    
    report += `---\n\n`;
  }
  
  // Footer
  report += `## 💡 How to Fix\n\n`;
  report += `1. Say **"Make this component accessible"** to GitHub Copilot\n`;
  report += `2. Check [\`.github/copilot-instructions.md\`](.github/copilot-instructions.md) for detailed guidelines\n`;
  report += `3. Use the PR checklist in [\`.github/PULL_REQUEST_TEMPLATE.md\`](.github/PULL_REQUEST_TEMPLATE.md)\n\n`;
  
  return report;
}

// Generate JSON report for GitHub Actions
function generateJsonReport(results) {
  const { allIssues } = results;
  
  return {
    summary: {
      total: allIssues.length,
      errors: allIssues.filter(i => i.severity === 'error').length,
      warnings: allIssues.filter(i => i.severity === 'warning').length
    },
    issues: allIssues
  };
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const outputFormat = args.includes('--json') ? 'json' : 'markdown';
  const srcDir = args.find(arg => arg.startsWith('--src='))?.split('=')[1] || 'src';
  
  try {
    const results = runAccessibilityChecks(srcDir);
    
    if (outputFormat === 'json') {
      const jsonReport = generateJsonReport(results);
      console.log(JSON.stringify(jsonReport, null, 2));
      
      // Exit with error code if issues found
      process.exit(jsonReport.summary.errors > 0 ? 1 : 0);
    } else {
      const report = generateReport(results);
      console.log(report);
      
      // Write to file for GitHub Actions
      fs.writeFileSync('accessibility-report.md', report);
      
      // Exit with error code if errors found (warnings are ok)
      const errorCount = results.allIssues.filter(i => i.severity === 'error').length;
      process.exit(errorCount > 0 ? 1 : 0);
    }
  } catch (error) {
    console.error('❌ Error running accessibility checks:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

// Export for testing
module.exports = {
  ACCESSIBILITY_RULES,
  runAccessibilityChecks,
  generateReport,
  generateJsonReport
};
