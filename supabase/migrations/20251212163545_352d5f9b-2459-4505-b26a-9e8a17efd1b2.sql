-- Allow inserting into super_admins when no admins exist (for first admin)
-- Or when the user is already a super admin
CREATE POLICY "Allow first super admin creation or by existing super admin"
ON public.super_admins
FOR INSERT
WITH CHECK (
  -- Allow if no super admins exist yet (first admin bootstrap)
  (SELECT COUNT(*) FROM public.super_admins) = 0
  OR
  -- Allow if current user is already a super admin
  is_super_admin(auth.uid())
);

-- Allow super admins to delete other super admins
CREATE POLICY "Super admins can delete super admins"
ON public.super_admins
FOR DELETE
USING (is_super_admin(auth.uid()));