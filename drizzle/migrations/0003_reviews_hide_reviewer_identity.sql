REVOKE SELECT ON public.reviews FROM anon, authenticated;
GRANT SELECT (id, product_id, reviewer_name, rating, comment, created_at) ON public.reviews TO anon;
GRANT SELECT (id, order_line_id, product_id, reviewer_name, rating, comment, created_at) ON public.reviews TO authenticated;
DROP POLICY IF EXISTS "reviews public" ON public.reviews;
CREATE POLICY "reviews public" ON public.reviews FOR SELECT TO anon, authenticated USING (rating BETWEEN 1 AND 5);