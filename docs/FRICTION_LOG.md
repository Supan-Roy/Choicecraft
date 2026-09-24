# Choicecraft Friction Log (Amazon Developer Hackathon 2026)

This log records real, observed issues, platform quirks, and developer experience friction encountered while developing Choicecraft on Vega OS, React Native Kepler, and related Amazon developer tools.

---

### Issue 1: Kepler Runtime Nested Text Limitation
- **Date**: September 24, 2026
- **Component**: `@amazon-devices/react-native-kepler` / Vega OS 1.2
- **Observed Behavior**: [index.js](file:///home/supanroy/Projects/Choicecraft/index.js) was generated with a comment: `// Temporary workaround for problem with nested text not working currently. LogBox.ignoreAllLogs();`. In standard React Native, nested `<Text>` components (e.g. `<Text>Hello <Text style={bold}>World</Text></Text>`) are standard for inline styling. Under Kepler 4.0 runtime on Vega OS, nested `<Text>` triggers rendering issues or crashes.
- **Impact on Development**: All TV typography must be structured as flat sibling `<Text>` nodes or flex containers, requiring custom layout adjustments for mixed styles.
- **Workaround / Resolution**: Designed all Choicecraft TV components ([App.tsx](file:///home/supanroy/Projects/Choicecraft/src/App.tsx), [ActionCard.tsx](file:///home/supanroy/Projects/Choicecraft/src/components/ActionCard.tsx), [QRCodePlaceholder.tsx](file:///home/supanroy/Projects/Choicecraft/src/components/QRCodePlaceholder.tsx)) strictly using flat `<Text>` trees without nesting.

---

### Issue 2: TypeScript Version Warning in `@typescript-eslint/typescript-estree`
- **Date**: September 24, 2026
- **Component**: `@amazon-devices/eslint-plugin-kepler` / `@typescript-eslint`
- **Observed Behavior**: Running `npm run lint` yields:
  ```text
  WARNING: You are currently running a version of TypeScript which is not officially supported by @typescript-eslint/typescript-estree.
  SUPPORTED TYPESCRIPT VERSIONS: >=4.3.5 <5.4.0
  YOUR TYPESCRIPT VERSION: 5.8.3
  ```
- **Impact on Development**: The template was generated with TypeScript `5.8.3` in `package.json`, but the included ESLint plugin stack officially expects `<5.4.0`.
- **Status / Workaround**: Non-fatal warning; linting still completes successfully with 0 errors. Documented to avoid unexpected AST parsing edge cases.

---

### Issue 3: Missing Assets Warning During Autolinking in `react-native build-vega`
- **Date**: September 24, 2026
- **Component**: `react-native build-vega` / `vpt`
- **Observed Behavior**: During `build:debug` and `build:release`, the build output logs:
  ```text
  cp: no such file or directory: /home/supanroy/Projects/Choicecraft/build/lib/rn-bundles/Release/assets/*
  ```
- **Impact on Development**: The build tool attempts a wildcard copy of bundle assets even when asset compilation puts assets in another path or no external asset references require copy. The build continues and exits with code 0 (`vpkg` generated successfully), but the warning is noisy in the logs.
- **Status / Workaround**: The `.vpkg` is properly archived and validated; harmless CLI output, but noteworthy for build pipeline diagnostics.

---

### Issue 4: Virtual Device Instance Path Mismatch in SDK CLI
- **Date**: September 24, 2026
- **Component**: Vega Virtual Device (`virtualdevice` binary) / Vega SDK `0.24.12112`
- **Observed Behavior**: The standalone `virtualdevice` binary defaults to `--instances-path ~/.kepler/virtual_device/instances`. However, Vega Studio and the Vega SDK install emulator instances inside `$SDK_PATH/vvd/instances` (e.g. `/home/supanroy/vega/sdk/vega-sdk/main/0.24.12112/vvd/instances`). Running commands directly without the flag fails with `object does not exist: ~/.kepler/...`.
- **Workaround / Resolution**: Explicitly pass `--instances-path /home/supanroy/vega/sdk/vega-sdk/main/0.24.12112/vvd/instances` or invoke via high-level `vega virtual-device start`.

---

### Issue 5: Terminal Process Group Signal on Emulator Subshell Exit
- **Date**: September 24, 2026
- **Component**: `vega virtual-device start` / Linux Process Management
- **Observed Behavior**: `vega virtual-device start` completes its wait loop and returns `Virtual device ready.`, then exits with code 0. If spawned from a non-interactive shell script or automation tool without a detached session group, the child QEMU process (`vega-virtual-device`) can receive SIGHUP upon terminal tear-down.
- **Workaround / Resolution**: Launch with `setsid vega virtual-device start` so the QEMU emulator runs in an independent session detached from the initiating subshell.
