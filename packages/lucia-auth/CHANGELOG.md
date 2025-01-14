# CHANGELOG

## 0.2.1

- Remove node dependencies (`crypto`, `util`) [#236](https://github.com/pilcrowOnPaper/lucia-auth/issues/236)
- Adds `@noble/hashes` as dependency
- Use block size (`r`) of `16` for hashing passwords
- Add `configs.hash.generate()` and `configs.hash.validate()` for custom hashing implementation
- Normalize password string on hashing

## 0.2.0

- [Breaking] Remove `validateRequest()` and `getSessionUserFromRequest()`
- [Breaking] Replace `parseRequest()` with `validateRequestHeaders()`
- [Breaking] `renewSession()` requires `setSessionCookie()` param and sets cookies
- [Breaking] `validateSession()` renews idle sessions
- [Breaking] `getSessionUser()` no longers renews idle sessions
- Add `validateSessionUser()`, `getSession()`, `getSessionUser()`, `SESSION_COOKIE_NAME`

## 0.1.4

- [Breaking] Params for `setCookie()` params for `validateRequest()` and `getSessionUserFromRequest()` is now `Session | null` instead of a `string`
- [Breaking] `createSessionCookies()`^ returns an array of `Cookie`
- [Breaking] Remove `createBlankSessionCookies()`

## 0.1.3

- Export `Lucia.Auth` and `Lucia.UserAttributes`
- Remove `cookie` and `cli-color` dependency

## 0.1.2

- [Breaking] `validateRequest()` requires `setCookie()` parameter
- Add `getSessionUserFromRequest()`

## 0.1.1

- Make input type of request for `parseRequest()` and `validateRequest()` as minimal as possible
