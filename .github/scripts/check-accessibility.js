const fs = require('fs');
const { execSync } = require('child_process');

const rules = [
    {
        name: 'Interactive icon without keyboard',
        pattern: /<mat-icon[^>]*\(click\)="[^"]*"(?![^>]*keydown\.enter)[^>]*>/g,
        message: 'Interactive mat-icon missing keyboard handlers',
        fix: 'Add (keydown.enter), (keydown.space), tabindex="0", role="button", and [attr.aria-label]',
        validate: (match) => {
            // Skip Angular Material menu triggers - they handle accessibility automatically
            if (match.includes('matMenuTriggerFor')) return false;
            // Skip tooltip triggers that use tooltip.toggle()
            if (match.includes('tooltip.toggle()')) return false;
            return true;
        }
    },
    {
        name: 'Link with click without keyboard',
        pattern: /<a[^>]*\(click\)="[^"]*"(?![^>]*routerLink)(?![^>]*keydown\.enter)[^>]*>/g,
        message: 'Link with (click) missing keyboard handlers',
        fix: 'Add (keydown.enter), (keydown.space), tabindex="0", role="button", and [attr.aria-label]',
        validate: (match) => {
            // Only flag if it's a true violation - links work with Enter by default,
            // but if no href and no keyboard handlers, flag it
            // Skip if inside sidenav or dialog close patterns (often handled by framework)
            if (match.includes('style="cursor: pointer;"') && match.includes('mat-icon')) {
                // These are typically framework-handled close buttons
                return false;
            }
            return true;
        }
    },
    {
        name: 'Span with click without keyboard',
        pattern: /<span[^>]*\(click\)="[^"]*"(?![^>]*keydown\.enter)[^>]*>/g,
        message: 'Interactive span missing keyboard handlers',
        fix: 'Add (keydown.enter), (keydown.space), tabindex="0", and role="button"'
    },
    {
        name: 'Image without alt',
        pattern: /<img(?![^>]*alt=)[^>]*>/g,
        message: 'Image missing alt attribute',
        fix: 'Add alt="Description" or alt="" for decorative images'
    },
    {
        name: 'SVG without role or accessible name',
        pattern: /<svg(?![^>]*role=)[^>]*>(?![^>]*<title>)/g,
        message: 'Standalone SVG missing role="img" and accessible name',
        fix: 'Add role="img" and aria-label="Description" or <title>Description</title>. Use aria-hidden="true" for decorative SVGs',
        validate: (match) => {
            // Skip if inside button or link (inherits accessibility from parent)
            return !match.includes('<button') && !match.includes('<a');
        }
    },
    {
        name: 'Old color contrast',
        pattern: /#228189/g,
        message: 'Using old color with poor contrast',
        fix: 'Replace #228189 with #1a6269 (better contrast ratio)'
    },
    {
        name: 'Button nesting anchor',
        pattern: /<button[^>]*>[\s\S]*?<a[^>]*>/g,
        message: 'Invalid HTML: <a> nested inside <button>',
        fix: 'Use <div> with icon + <a>, or <button> with <span>'
    },
    {
        name: 'Back link without aria-label',
        pattern: /<a[^>]*routerLink[^>]*>[\s\S]*?chevron_left[\s\S]*?<\/mat-icon>[\s\S]*?<\/a>/g,
        message: 'Back navigation link missing [attr.aria-label]',
        fix: 'Add [attr.aria-label]="\'Back to [page]\'" and aria-hidden="true" to icon',
        validate: (match) => !match.includes('aria-label')
    },
    {
        name: 'Icon-only button without aria-label',
        pattern: /<button[^>]*mat-icon-button[^>]*>[\s\S]*?<mat-icon[^>]*>[^<]*<\/mat-icon>[\s\S]*?<\/button>/g,
        message: 'Icon-only button missing aria-label (WCAG 4.1.2 violation)',
        fix: 'Add aria-label="Action description" or [attr.aria-label]="\'Action description\'" to button',
        validate: (match) => {
            // Only flag if NO aria-label at all (plain or Angular binding)
            if (match.includes('aria-label')) return false;
            if (match.includes('[attr.aria-label]')) return false;
            return true;
        }
    },
    {
        name: 'Interactive icon without aria-label',
        pattern: /<mat-icon[^>]*\(click\)="[^"]*"[^>]*>/g,
        message: 'Interactive icon missing aria-label',
        fix: 'Add aria-label="Action description" or [attr.aria-label]="\'Action description\'"',
        validate: (match) => {
            // Skip if has any form of aria-label
            if (match.includes('aria-label')) return false;
            if (match.includes('[attr.aria-label]')) return false;
            // Skip Material menu triggers
            if (match.includes('matMenuTriggerFor')) return false;
            // Skip tooltip toggles
            if (match.includes('tooltip.toggle()')) return false;
            return true;
        }
    },
    {
        name: 'Focusable element with aria-hidden true',
        pattern: /<mat-icon[^>]*tabindex="0"(?![^>]*aria-hidden="false")[^>]*>/g,
        message: 'CRITICAL: Focusable mat-icon (tabindex="0") must have aria-hidden="false"',
        fix: 'Add aria-hidden="false" to expose element to assistive technology'
    },
    {
        name: 'Interactive icon without role button',
        pattern: /<mat-icon[^>]*tabindex="0"(?![^>]*role="button")[^>]*>/g,
        message: 'Interactive mat-icon missing role="button"',
        fix: 'Add role="button" to indicate it is a clickable button'
    },
    {
        name: 'Decorative icon missing aria-hidden',
        pattern: /<mat-icon[^>]*>(chevron_left|chevron_right|arrow_back|arrow_forward|done)(?![^>]*aria-hidden)/g,
        message: 'Decorative icon missing aria-hidden="true"',
        fix: 'Add aria-hidden="true" and role="presentation" for decorative icons',
        validate: (match) => !match.includes('aria-hidden=')
    },
    {
        name: 'Done icon without aria-hidden',
        pattern: /<mat-icon[^>]*class="icongreen"(?![^>]*aria-hidden)[^>]*>done<\/mat-icon>/g,
        message: 'Decorative done icon missing aria-hidden="true"',
        fix: 'Add aria-hidden="true" to hide decorative checkmark from screen readers'
    },
    {
        name: 'Close button without descriptive label',
        pattern: /<a[^>]*\(click\)="(opened|openedSortBy|openedFilter)\s*=\s*false"(?![^>]*aria-label)[^>]*>/g,
        message: 'Close button has generic or missing [attr.aria-label]',
        fix: 'Add [attr.aria-label]="\'Close [menu name]\'" (e.g., "Close filter menu", "Close sort menu")'
    },
    {
        name: 'Back icon without role presentation',
        pattern: /<mat-icon[^>]*aria-hidden="true"[^>]*>chevron_left<\/mat-icon>/g,
        message: 'Decorative back icon missing role="presentation"',
        fix: 'Add role="presentation" to clarify decorative intent',
        validate: (match) => !match.includes('role="presentation"')
    },
    {
        name: 'Loading spinner without status role',
        pattern: /<mat-spinner(?![^>]*role="status")[^>]*>/g,
        message: 'Loading indicator missing role="status" and aria-live',
        fix: 'Wrap spinner in container with role="status", aria-live="polite", aria-busy="true", and visually-hidden text'
    }
];

function checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const errors = [];

    rules.forEach(rule => {
        const matches = [...content.matchAll(rule.pattern)];

        matches.forEach(match => {
            // If there's a validate function, check if error should be reported
            if (rule.validate && !rule.validate(match[0])) {
                return;
            }

            // Find line number
            const beforeMatch = content.substring(0, match.index);
            const lineNumber = beforeMatch.split('\n').length;

            // Get the actual line content
            const matchedLine = lines[lineNumber - 1];

            errors.push({
                file: filePath,
                line: lineNumber,
                rule: rule.name,
                message: rule.message,
                code: matchedLine.trim(),
                fix: rule.fix
            });
        });
    });

    return errors;
}

function main() {
    try {
        // Get changed files
        const baseBranch = process.env.GITHUB_BASE_REF || 'main';
        let changedFiles;

        try {
            changedFiles = execSync(`git diff --name-only origin/${baseBranch}...HEAD`, { encoding: 'utf8' })
                .split('\n')
                .filter(file => file.endsWith('.html'));
        } catch (error) {
            // Fallback to all HTML files if git diff fails
            const { globSync } = require('glob');
            changedFiles = globSync('src/**/*.component.html');
        }

        if (changedFiles.length === 0) {
            console.log('No HTML files changed.');
            const results = {
                filesChecked: 0,
                errors: []
            };
            fs.writeFileSync('.github/a11y-results.json', JSON.stringify(results, null, 2));
            return;
        }

        console.log(`Checking ${changedFiles.length} HTML file(s)...`);

        let allErrors = [];
        changedFiles.forEach(file => {
            if (fs.existsSync(file)) {
                console.log(`  Checking: ${file}`);
                const errors = checkFile(file);
                allErrors = allErrors.concat(errors);
            }
        });

        const results = {
            filesChecked: changedFiles.length,
            errors: allErrors
        };

        fs.writeFileSync('.github/a11y-results.json', JSON.stringify(results, null, 2));

        if (allErrors.length > 0) {
            console.log(`\n❌ Found ${allErrors.length} accessibility issue(s):`);
            allErrors.forEach(error => {
                console.log(`  ${error.file}:${error.line} - ${error.message}`);
            });
            process.exit(1);
        } else {
            console.log(`\n✅ All accessibility checks passed!`);
        }

    } catch (error) {
        console.error('Error running accessibility checks:', error);
        process.exit(1);
    }
}

main();
