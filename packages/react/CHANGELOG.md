# Changelog

All notable changes to `halo-ui-react`. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/).

## Unreleased

### Added

- `halo-ui-react/popover`: `Popover` parts (`Root`, `Trigger`, `Popup`, `Title`, `Description`, `Close`) on the native popover attribute and CSS anchor positioning, with a measured fallback where anchor positioning is missing. The popup grows out of its trigger on a spring, and the coat light gathers on the edge that faces it.
- `halo-ui-react/swipe`: `Swipe` parts (`Group`, `Root`, `Content`, `Actions`, `Action`). A flick-projected release opens the row or runs its `commit` action; every action is a real button that Tab reveals; `Swipe.Group` keeps one row open, closes the gap a removed row leaves with transforms, moves focus on, and announces results.
- Named exports for every popover and swipe part (`PopoverRoot`, `SwipeGroup` and so on) beside the namespaces.

### Changed

- README: claims replaced with the behaviour behind them, and a size table generated from the build (toast 8.5 kB, drawer 5.9 kB, min+gzip).
- Package description rewritten, and `bottom-sheet`, `notifications` and `snackbar` added to keywords.

## 0.1.0 (2026-11-15)

### Added

- `toast()` with `success`, `error`, `warning`, `info`, `loading`, `promise`, `update`, `dismiss` and `isActive`, plus `toast.undo()`, `toast.stream()`, `from` (launch from the trigger) and `group` (collapse repeats).
- `<Toaster>` with six positions, six spring-driven entrances, three time-left indicators, `intent` colouring, density, radius, and polite and assertive live regions.
- `Drawer` parts (`Root`, `Trigger`, `Content`, `Handle`, `Title`, `Description`, `Close`, `Scroll`) and `useDrawer`, on the native `<dialog>`, with snap points chosen by flick projection and an optional page `recess`.
- The spring engine on its own: `halo-ui-react/spring`.
- Nine worlds (`dichroic`, `partition`, `smoked`, `vapor`, `crystal`, `ink`, `opal`, `mercury`, `vellum`) and custom worlds in plain CSS.
