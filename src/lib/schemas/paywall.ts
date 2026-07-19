import { z } from 'zod';

export const couponSchema = z.object({
	code: z.string().trim().min(1, 'Coupon code cannot be empty')
});

export type CouponInput = z.infer<typeof couponSchema>;
