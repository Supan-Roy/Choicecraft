## Description

<!-- Provide a concise description of the changes introduced by this pull request. -->

## Motivation & Context

<!-- Why is this change required? What problem does it solve? If it fixes an open issue, link it here: e.g. Fixes #123 -->

## Type of Change

- [ ] `feat`: New feature or user-facing functionality
- [ ] `fix`: Bug fix
- [ ] `docs`: Documentation update or addition
- [ ] `refactor`: Code refactoring without behavior change
- [ ] `test`: Adding or improving tests
- [ ] `chore`: Tooling, build config, or dependency updates

---

## Vega OS & TV UX Checklist

- [ ] **Flat Typography**: Ensured no nested `<Text>` components are used (Kepler 4.0 runtime constraint).
- [ ] **Remote Navigation**: Tested D-pad focus flow (`hasTVPreferredFocus`, `TVFocusGuideView`, visible focus states).
- [ ] **10-Foot UI**: Legible font sizes, high contrast, and safe overscan margins.
- [ ] **Multi-Device Privacy**: Ensured private inputs remain off the shared TV screen.

---

## Engineering & Quality Verification

- [ ] `npx tsc --noEmit` passes with 0 errors
- [ ] `npm run lint` passes with 0 errors
- [ ] `npm test` passes with all tests and snapshots green
- [ ] `npm run build:debug` or `npm run build:release` successfully generates `.vpkg`
- [ ] Real platform issues or SDK quirks documented in `docs/FRICTION_LOG.md` (if applicable)
