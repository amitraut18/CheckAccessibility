# Accessibility Quick Reference

## Common Patterns

### Interactive Icon
```html
<mat-icon (click)="fn()"
          (keydown.enter)="fn()"
          (keydown.space)="fn(); $event.preventDefault()"
          tabindex="0"
          role="button"
          [attr.aria-label]="'Action'">
  icon
</mat-icon>
```

### Back Link
```html
<a routerLink="/back" [attr.aria-label]="'Back to Page'">
  <mat-icon aria-hidden="true">chevron_left</mat-icon>
</a>
```

### Clickable Link (no routerLink)
```html
<a (click)="fn()"
   (keydown.enter)="fn()"
   (keydown.space)="fn(); $event.preventDefault()"
   tabindex="0"
   role="button"
   [attr.aria-label]="'Action'">
  Link Text
</a>
```

### Interactive Span
```html
<span (click)="fn()"
      (keydown.enter)="fn()"
      (keydown.space)="fn(); $event.preventDefault()"
      tabindex="0"
      role="button">
  Text
</span>
```

### Form Error Focus (TypeScript)
```typescript
private focusFirstInvalidField(): void {
  const firstInvalidControl = Object.keys(this.form.controls)
    .find(key => this.form.controls[key].invalid);
  if (firstInvalidControl) {
    const el = document.querySelector(
      `[formControlName="${firstInvalidControl}"]`
    ) as HTMLElement;
    if (el) setTimeout(() => el.focus(), 100);
  }
}
```

### Required Field Label
```html
<p class="mat-caption" style="color: #5f6368; margin: 0.5rem 0;">
  <span aria-hidden="true">*</span> Indicates required field
</p>
```

### Icon-Only Button
```html
<button mat-icon-button [attr.aria-label]="'Delete'">
  <mat-icon aria-hidden="true">delete</mat-icon>
</button>
```

### Password Toggle
```html
<button mat-icon-button
        matSuffix
        (click)="hide = !hide"
        [attr.aria-label]="'Toggle password visibility'"
        [attr.aria-pressed]="!hide">
  <mat-icon>{{ hide ? 'visibility_off' : 'visibility' }}</mat-icon>
</button>
```

### Loading Spinner
```html
<div role="status" aria-live="polite" aria-busy="true">
  <mat-spinner aria-label="Loading"></mat-spinner>
  <span class="visually-hidden">Loading, please wait...</span>
</div>
```

## Copilot Commands

In Copilot Chat:
- `@workspace Make this component accessible`
- `@workspace Add keyboard support to all icons`
- `@workspace Fix accessibility issues in this file`
- `@workspace Review accessibility problems`

In Code (type comment):
- `// make accessible`
- `// add keyboard support`
- `// TODO: fix accessibility`

## Color Codes

- ✅ Use: `#1a6269` (contrast 4.8:1)
- ❌ Don't use: `#228189` (contrast 3.5:1)

## Checklist

- [ ] All images have `alt` attributes
- [ ] All interactive icons have keyboard handlers
- [ ] All links have `[attr.aria-label]` where needed
- [ ] All buttons have accessible names
- [ ] No `<a>` nested inside `<button>`
- [ ] Color contrast meets 4.5:1 ratio
- [ ] Focus indicators visible (3px solid outline)
- [ ] Forms focus on first error
- [ ] Required fields explained
