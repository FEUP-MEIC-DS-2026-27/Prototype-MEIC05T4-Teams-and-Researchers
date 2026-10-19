## Architecture
- All app data lives in `src/modules/data` (types, seed, pure queries/operations, React store persisted to localStorage); UI reads only through these so a future API can replace the store.
- Feature UI is grouped in `src/modules/{dashboard,researchers,teams}`; routes in `src/routes` are thin wrappers.
- Demo roles (visitor/researcher/coordinator) are a UI simulation in the store, not authentication.
