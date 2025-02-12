---
order: 0
layout: "@layouts/DocumentLayout.astro"
title: "Get session in the server"
---

This can be used in any server context, including pages and API routes.

`@lucia-auth/astro` provides [`AuthRequest`](/astro/api-reference/server-api#authrequest) instance that takes in your Lucia `auth` instance, `request`, and Astro's cookies module

```ts
import { AuthRequest } from "@lucia-auth/astro";
import { auth } from "../lib/lucia";

const authRequest = new AuthRequest(auth, {
	request,
	cookies
});
```

This provides methods to interact with the current request, such as [`getSession()`](/astro/api-reference/server-api#getsession). This will validate the request and return the current session. This will also attempt to renew the session as well if the original session was invalid.

```ts
import { AuthRequest } from "@lucia-auth/astro";

const authRequest = new AuthRequest();
const session = await authRequest.getSession();
```

Alternatively, you can use [`getSessionUser()`](/astro/api-reference/server-api#getsessionuser) which works similarly to `getSession()` but returns both the user and session without an additional database call.

```ts
import { AuthRequest } from "@lucia-auth/astro";

const authRequest = new AuthRequest();
const { session, user } = await authRequest.getSessionUser();
```

## Example

### Pages

```astro
---
import { AuthRequest } from "@lucia-auth/astro";
import { auth } from "../lib/lucia";

const authRequest = new AuthRequest(auth, Astro);
const session = await authRequest.getSession();
---
```

### API routes

```ts
import { AuthRequest } from "@lucia-auth/astro";
import { auth } from "../../lib/lucia";
import type { APIRoute } from "astro";

export const get: APIRoute = async (context) => {
	const authRequest = new AuthRequest(auth, context);
	const session = await authRequest.getSession();
	// ...
};
```
