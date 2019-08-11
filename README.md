# AdvancedNodeStarter
Starting project for a course on Advanced Node @ Udemy by Stephen Grider.

**Updated for Node 12, React 16.9, and all latest versions of all dependencies**

## Other Changes

- Uses `.env` to manage keys: Check `.env.placeholder` for setup
- Uses `jsconfig.json` to allow module path shortcut directly from `src` folder
- Uses `module-aliases` in `client` to allow aliasing of modules
- Uses `nodemon.json` to setup `nodemon`'s setting
- `client` is excluded from `nodemon`'s path
- Cleaned up semicolons from `,js`
- Using `yarn` instead of `npm`: `yarn -v` must be `^1.17.0`
- Using latest `node`: `node -v` must be `^12.7.0`
