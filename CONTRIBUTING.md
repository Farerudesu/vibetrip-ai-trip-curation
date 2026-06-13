# Contributing to VibeTrip

Thanks for your interest in contributing! 🎉

## Getting Started

1. **Fork** the repository
2. **Clone** your fork locally
3. **Set up** the development environment (see [README.md](README.md#-getting-started))
4. **Create a branch** for your feature or fix:
   ```bash
   git checkout -b feature/my-awesome-feature
   ```

## Development Workflow

1. Make your changes in the `src/` directory
2. Test locally with `npm run dev`
3. Verify the build passes: `npm run build`
4. If modifying Android-specific features, test with:
   ```bash
   npx cap sync android
   cd android && ./gradlew assembleDebug
   ```

## Code Style

- **TypeScript** — All source files use `.tsx` / `.ts`
- **Components** — One component per file in `src/components/`
- **Translations** — Add both English and Indonesian translations in `src/data/constants.tsx`
- **Theme Support** — All new UI must support both dark and light themes via `ThemeContext`
- **No hardcoded secrets** — All API keys and config go in `.env` (never committed)

## Pull Request Guidelines

- Keep PRs focused — one feature or fix per PR
- Write a clear description of what changed and why
- Include screenshots for UI changes
- Make sure `npm run build` passes before submitting

## Firebase & API Keys

Each contributor should use their **own** Firebase project and API keys. See the README for setup instructions. Never commit API keys or `google-services.json`.

## Reporting Bugs

Open an issue with:
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Device/browser info

## Feature Requests

Open an issue with the `enhancement` label describing:
- What you'd like to see
- Why it would be useful
- Any implementation ideas

---

Thanks for helping make VibeTrip better! 🌴
