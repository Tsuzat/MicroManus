import { json } from '@sveltejs/kit';

export const GET = () => {
	return json({ message: 'Micromanus is working as expected' });
};
