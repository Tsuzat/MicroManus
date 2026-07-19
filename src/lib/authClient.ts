import { createAuthClient } from 'better-auth/client';
import { lastLoginMethodClient } from 'better-auth/client/plugins';
import { polarClient } from '@polar-sh/better-auth/client';

export const authClient = createAuthClient({
	plugins: [lastLoginMethodClient(), polarClient()]
});
