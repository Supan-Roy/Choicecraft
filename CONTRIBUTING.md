# Contributing to Choicecraft

Thank you for your interest in contributing to **Choicecraft**! 

Choicecraft is a TV-first group consensus platform that transforms conflicting individual preferences into transparent, fair, and explainable shared decisions. We are building this for the **Amazon Developer Hackathon 2026** targeting Fire TV and Vega OS.

---

## Code of Conduct

All contributors and participants are expected to adhere to our [Code of Conduct](file:///home/supanroy/Projects/Choicecraft/CODE_OF_CONDUCT.md). Please report unacceptable behavior to **supanroy2021@gmail.com**.

---

## Architectural Principles

When writing code for Choicecraft, keep our core technical tenets in mind:

1. **Deterministic Consensus Engine**: The decision engine must be testable, deterministic, and explainable. AI/LLM components support human narration, but an LLM must never silently override hard constraints or calculate core rankings.
2. **TV-First Design**: The TV is a shared public display navigated with a D-pad remote from a 10-foot distance. Interactions must feature clear focus indicators, large typography, and zero reliance on touch gestures or complex on-screen typing.
3. **Multi-Device Privacy**: Detailed personal inputs (runtime limits, excluded genres, moods) occur privately on mobile web browsers, not on the public TV screen.
4. **Vega OS & Kepler Compatibility**:
   - **No Nested `<Text>`**: Kepler runtime on Vega OS currently exhibits issues with nested `<Text>` components. All typography must be flat sibling nodes.
   - **Focus Guides**: Interactive components must be wrapped in `TVFocusGuideView` and support explicit focus states (`onFocus`, `onBlur`, `hasTVPreferredFocus`).

---

## Development Setup

### Prerequisites
- **Node.js**: `>= 20.x`
- **npm**: `>= 9.x`
- **Vega SDK**: `>= 0.24.12112` and Vega CLI (`vega`)
- **Vega Virtual Device / Simulator** or compatible Fire TV device

### Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/Supan-Roy/Choicecraft.git
cd Choicecraft
npm install
```

### Verification & Testing
Before submitting changes, ensure all checks pass:

```bash
# 1. Type check
npx tsc --noEmit

# 2. Kepler ESLint check
npm run lint

# 3. Unit & Snapshot tests
npm test

# 4. Debug Vega Package Build
npm run build:debug

# 5. Production Release Build
npm run build:release
```

---

## Submitting Pull Requests

1. **Create a Branch**: Use a descriptive branch name:
   - `feat/feature-name`
   - `fix/bug-description`
   - `docs/documentation-update`
2. **Commit Conventions**: Use [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat: add consensus scoring strategy`
   - `fix: resolve d-pad navigation trap in room screen`
   - `docs: update friction log with vega cli findings`
3. **Add Tests**: Accompany new features or bug fixes with tests in the `test/` directory.
4. **Update Logs**: If you encountered a real SDK or platform friction point, document it in [docs/FRICTION_LOG.md](file:///home/supanroy/Projects/Choicecraft/docs/FRICTION_LOG.md).
5. **Open a PR**: Fill out the [Pull Request Template](file:///home/supanroy/Projects/Choicecraft/.github/pull_request_template.md).

---

## Reporting Issues

- **Bug Reports**: Use our [Bug Report Template](file:///home/supanroy/Projects/Choicecraft/.github/ISSUE_TEMPLATE/bug_report.md).
- **Feature Requests**: Use our [Feature Request Template](file:///home/supanroy/Projects/Choicecraft/.github/ISSUE_TEMPLATE/feature_request.md).
- **Security Vulnerabilities**: See our [Security Policy](file:///home/supanroy/Projects/Choicecraft/SECURITY.md).
