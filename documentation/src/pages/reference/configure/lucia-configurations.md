---
order: 0
layout: "@layouts/DocumentLayout.astro"
title: "Lucia configurations"
---

Configurations for `lucia()`.

```ts
interface Configurations {
	adapter:
		| Adapter
		| {
				user: UserAdapter;
				session: SessionAdapter;
		  };
	env: Env;
	csrfProtection?: boolean;
	deleteCookieOptions?: CookieOption[];
	generateCustomUserId?: () => Promise<string | null>;
	idlePeriodTimeout?: number;
	hash?: {
		generate: (s: string) => MaybePromise<string>;
		validate: (s: string, hash: string) => MaybePromise<boolean>;
	};
	sessionCookieOptions?: CookieOption[];
	sessionTimeout?: number;
	transformUserData?: (userData: UserData) => Record<any, any>;
}
```

```ts
type CookieOption = {
	sameSite?: "strict" | "lax";
	path?: string;
	domain?: string;
};
```

## Required

### `adapter`

An adapter for your database. If you're using a single database:

| type      |
| --------- |
| `Adapter` |

or, if you're using a different adapter for `user` and `session` table. A normal `Adapter` can be used for both `adapter.user` and `adapter.session`

#### `user` (required)

An adapter for the database that stores users - can be a normal [`Adapter`](/reference/adapters/api#adapter) adapter.

| type                                                      |
| --------------------------------------------------------- |
| [`UserAdapter`](/reference/types/lucia-types#useradapter) |

#### `session` (required)

An adapter for the database that stores sessions.

| type                                                         |
| ------------------------------------------------------------ |
| [`SessionAdapter`](/reference/types/lucia-types#useradapter) |

### `env`

Tells Lucia if the app is running on HTTP or HTTPS.

| type              | description                                                |
| ----------------- | ---------------------------------------------------------- |
| `"DEV" \| "PROD"` | `"DEV"` if the app is hosted on HTTP, `"PROD"` if on HTTPS |

## Optional

### `csrfProtection`

Checks if the request is from a trusted origin (where the app is hosted) in [`validateRequestHeaders()`](/reference/api/server-api#validaterequestheaders). If you set this to `false`, make sure to add your own CSRF protection.

| type      | default |
| --------- | ------- |
| `boolean` | `true`  |

### `deleteCookieOptions`

A list of additional cookie options to [`sessionCookieOptions`](/reference/configure/lucia-configurations#sessioncookieoptions) for deleting session cookie(s).

| type             | default |
| ---------------- | ------- |
| `CookieOption[]` | `[]`    |

### `generateCustomUserId()`

A function that generates a random user id. The database will create its own user id if the returned value is `null`

```ts
const generateCustomUserId: () => Promise<string \| null>
```

##### Returns

| type               | description                                                |
| ------------------ | ---------------------------------------------------------- |
| `string` \| `null` | a user id - null to let the database handle the generation |

### `hash`

#### `generate()` (required)

Generates a password-safe hash. Make sure the algorithm used is safe for hashing passwords - algorithms such as `md5` and `SHA-1` are \*\*NOT suitable for hashing passwords`. The following are generally deemed safe for such use case: `bcrypt`, `scrypt`, `argon2`, `PBKDF2`.

```ts
const generate: (s: string) => MaybePromise<string>;
```

##### Parameter

| name | type     | description        |
| ---- | -------- | ------------------ |
| s    | `string` | the string to hash |

##### Returns

| type     | description                                    |
| -------- | ---------------------------------------------- |
| `string` | the hashed string - can be a promise if needed |

#### `validate()` (required)

Validates a string against a hash generated using [`hash.generate()`](/reference/configure/lucia-configurations#generate-required).

```ts
const generate: (s: string, hash: string) => MaybePromise<string>;
```

##### Parameter

| name | type     | description                         |
| ---- | -------- | ----------------------------------- |
| s    | `string` | the string to validate              |
| hash | `string  | hash to validate the string against |

##### Returns

| type      | description                                                     |
| --------- | --------------------------------------------------------------- |
| `boolean` | `true` if valid, `false` otherwise - can be a promise if needed |

### `idlePeriodTimeout`

The time in milliseconds the idle period lasts for - or the time since session expiration the user can continue without signing in again. The session can be renewed if it's under `sessionTimeout + idlePeriodTimeout` since when issued.

| type     | default                              |
| -------- | ------------------------------------ |
| `number` | `1000 * 60 * 60 * 24 * 14` (2 weeks) |

### `sessionCookieOptions`

A list of cookie options for setting session cookie(s). Beware that setting the domain without a domain without a subdomain will make the cookie available to **_all_** subdomains, which is a major security issue. Some options cannot be configured for security reasons.

| type             | default                            |
| ---------------- | ---------------------------------- |
| `CookieOption[]` | `[{ sameSite: "lax", path: "/" }]` |

### `sessionTimeout`

The time in milliseconds the active period lasts for.

| type     | default                          |
| -------- | -------------------------------- |
| `number` | `1000 * 60 * 60 * 24` (24 hours) |

### `transformUserData()`

This will be called to transform the raw data from `user` table to an object that will be mapped to [`User`](/reference/types/lucia-types#user).

```ts
const transformUserData: (userData: UserData) => Record<any, any>;
```

#### Parameter

| name     | type                                                | description                 |
| -------- | --------------------------------------------------- | --------------------------- |
| userData | [`UserData`](/reference/types/lucia-types#userdata) | the user data from database |

#### Returns

| type               | description                               |
| ------------------ | ----------------------------------------- |
| `Record<any, any>` | an object that will be mapped to [`User`] |

#### Default

```ts
const transformUserData = async () => {
	userId: string;
};
```
