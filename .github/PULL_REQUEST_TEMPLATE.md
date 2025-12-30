## Description
<!-- Describe your changes in detail -->

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Accessibility improvement
- [ ] Code refactoring
- [ ] Documentation update

## Accessibility Checklist
Please ensure your PR follows WCAG 2.1 AA standards:

- [ ] All images have `alt` attributes
- [ ] Interactive icons have `tabindex`, `role`, and `aria-label`
- [ ] Links with click handlers have keyboard support (keydown.enter/space)
- [ ] Icon-only buttons have descriptive `aria-label` or `[attr.aria-label]`
- [ ] No focusable elements with `aria-hidden="true"`
- [ ] Color contrast meets 4.5:1 ratio (use #1a6269 instead of #228189)
- [ ] No invalid HTML nesting (anchor inside button)
- [ ] SVG elements have `role="img"` and accessible names
- [ ] Loading indicators have `role="status"` and `aria-live="polite"`
- [ ] Form validation includes focus management

## Testing
- [ ] Tested with keyboard navigation (Tab, Enter, Space)
- [ ] Tested with screen reader
- [ ] Verified color contrast ratios
- [ ] Manual accessibility review completed

## Screenshots (if applicable)
<!-- Add screenshots to help explain your changes -->

## Additional Notes
💡 Use GitHub Copilot with "Make this component accessible" to auto-fix accessibility issues.
📖 See [Accessibility Guidelines](.github/copilot-instructions.md) for detailed rules.
