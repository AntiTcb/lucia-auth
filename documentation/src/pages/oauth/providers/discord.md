---
order: 0
layout: "@layouts/DocumentLayout.astro"
title: "Discord"
---

OAuth integration for Discord. Refer to [Discord OAuth documentation](https://discord.com/developers/docs/topics/oauth2) for getting the required credentials.

### Initialization

```ts
import discord from "@lucia-auth/oauth/discord";
import { auth } from "./lucia.js";

const discordAuth = discord(auth, configs);
```

```ts
const discord: (
	auth: Auth,
	configs: {
		clientId: string;
		clientSecret: string;
		scope?: string[];
	}
) => DiscordProvider;
```

#### Parameter

| name                 | type                                        | description                    | optional |
| -------------------- | ------------------------------------------- | ------------------------------ | -------- |
| auth                 | [`Auth`](/reference/types/lucia-types#auth) | Lucia instance                 |          |
| configs.clientId     | `string`                                    | Discord OAuth app client id     |          |
| configs.clientSecret | `string`                                    | Discord OAuth app client secret |          |
| configs.scope        | `string[]`                                  | an array of scopes             | true     |

### Redirect user to authorization url

Redirect the user to Discord's authorization url, which can be retrieved using `getAuthorizationUrl()`.

```ts
import discord from "@lucia-auth/oauth/discord";
import { auth } from "./lucia.js";

const discordAuth = discord(auth, configs);

const [authorizationUrl, state] = discordAuth.getAuthorizationUrl();

// the state can be stored in cookies or localstorage for request validation on callback
setCookie("state", state, {
	path: "/",
	httpOnly: true, // only readable in the server
	maxAge: 60 * 60 // a reasonable expiration date
}); // example with cookie
```

### Validate callback

The authorization code and state can be retrieved from the `code` and `state` search params, respectively, inside the callback url. Validate that the state is the same as the one stored in either cookies or localstorage before passing the `code` to `validateCallback()`.

```ts
import discord from "@lucia-auth/oauth/discord";
const discordAuth = discord();

// get code and state from search params
const url = new URL(callbackUrl);
const code = url.searchParams.get("code") || ""; // http://localhost:3000/api/discord?code=abc&state=efg => abc
const state = url.searchParams.get("state") || ""; // http://localhost:3000/api/discord?code=abc&state=efg => efg

// get state stored in cookie (refer to previous step)
const storedState = headers.cookie.get("state");

// validate state
if (state !== storedState) throw new Error(); // invalid state

const discordSession = await discordAuth.validateCallback(code);
```

## `discord()` (default)

Refer to [`Initialization`](/oauth/providers/discord#initialization).

## `DiscordProvider`

```ts
interface DiscordProvider {
	getAuthorizationUrl: <State = string | null | undefined = undefined>(state?: State) => State extends null ? [url: string] : [url: string, state: string];
	validateCallback: (code: string) => Promise<DiscordProviderSession>;
}
```

Implements [`OAuthProvider`](/oauth/reference/api-reference#oauthprovider).

### `getAuthorizationUrl()`

Refer to [`OAuthProvider.getAuthorizationUrl()`](/oauth/reference/api-reference#getauthorizationurl).

### `validateCallback()`

Implements [`OAuthProvider.validateCallback()`](/oauth/reference/api-reference#getauthorizationurl). `code` can be acquired from the `code` search params inside the callback url.

```ts
const validateCallback: (code: string) => Promise<DiscordProviderSession>;
```

#### Returns

| type                                                                     |
| ------------------------------------------------------------------------ |
| [`DiscordProviderSession`](/oauth/providers/discord#discordprovidersession) |

## `DiscordProviderSession`

```ts
interface DiscordProviderSession {
	existingUser: User | null;
	createUser: (userAttributes?: Lucia.UserAttributes) => Promise<User>;
	providerUser: DiscordUser;
	accessToken: string;
}
```

Implements [`ProviderSession`](/oauth/reference/api-reference#providersession).

| name                                             | type                                                  | description                                       |
| ------------------------------------------------ | ----------------------------------------------------- | ------------------------------------------------- |
| existingUser                                     | [`User`](/reference/types/lucia-types#user)` \| null` | existing user - null if non-existent (= new user) |
| [createUser](/oauth/providers/discord#createuser) | `Function`                                            |                                                   |
| providerUser                                     | [`DiscordUser`](/oauth/providers/discord#discorduser)    | Discord user                                       |
| accessToken                                      | `string`                                              | Discord access token                               |

### `createUser()`

```ts
const createUser: (userAttributes?: Lucia.UserAttributes) => Promise<User>;
```

Creates a new using [`Lucia.createUser()`](/reference/api/server-api#createuser) using the following parameter:

| name               | value                                                                  |
| ------------------ | ---------------------------------------------------------------------- |
| provider           | `"discord"`                                                             |
| identifier         | Discord user id ([`DiscordUser.id`](/oauth/providers/discord#discorduser)) |
| options.attributes | `userAttributes`                                                       |

## `DiscordUser`

```ts
interface DiscordUser {
	id: string;
	username: string;
	discriminator: string;
	avatar: string | null;
	bot?: boolean;
	system?: boolean;
	mfa_enabled?: boolean;
	banner?: string | null;
	accent_color?: number | null;
	locale?: string;
	verified?: boolean;
	email?: string | null;
	flags?: number;
	premium_type?: number;
	public_flags?: number;
}
```
