-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'customer');
CREATE TYPE public.order_status AS ENUM ('pending','confirmed','preparing','ready','out_for_delivery','completed','cancelled');
CREATE TYPE public.fulfillment_type AS ENUM ('delivery','pickup');
CREATE TYPE public.payment_method AS ENUM ('cod','cop','online');
CREATE TYPE public.payment_status AS ENUM ('unpaid','paid','refunded');
CREATE TYPE public.reservation_status AS ENUM ('pending','confirmed','cancelled','completed');
CREATE TYPE public.catering_status AS ENUM ('pending','contacted','confirmed','cancelled','completed');

-- ============ SHARED TRIGGER ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_own_select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_own_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_own_update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'phone', NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;
CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','staff'));
$$;
CREATE POLICY "user_roles_own_select" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "user_roles_admin_all" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ BRANCHES ============
CREATE TABLE public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  short_name TEXT,
  address TEXT,
  area TEXT,
  city TEXT,
  phone TEXT,
  whatsapp TEXT,
  maps_url TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  opening_time TIME,
  closing_time TIME,
  image_url TEXT,
  delivery_available BOOLEAN NOT NULL DEFAULT true,
  pickup_available BOOLEAN NOT NULL DEFAULT true,
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_open BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.branches TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.branches TO authenticated;
GRANT ALL ON public.branches TO service_role;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "branches_public_read" ON public.branches FOR SELECT TO anon, authenticated USING (is_active = true OR public.is_staff(auth.uid()));
CREATE POLICY "branches_admin_write" ON public.branches FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_branches_updated BEFORE UPDATE ON public.branches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ CATEGORIES ============
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_public_read" ON public.categories FOR SELECT TO anon, authenticated USING (is_active = true OR public.is_staff(auth.uid()));
CREATE POLICY "categories_admin_write" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ PRODUCTS ============
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  includes TEXT[],
  image_url TEXT,
  base_price NUMERIC(10,2),
  price_note TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  is_chef_special BOOLEAN NOT NULL DEFAULT false,
  is_bestseller BOOLEAN NOT NULL DEFAULT false,
  is_new BOOLEAN NOT NULL DEFAULT false,
  out_of_stock BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_products_category ON public.products(category_id);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_public_read" ON public.products FOR SELECT TO anon, authenticated USING (is_active = true OR public.is_staff(auth.uid()));
CREATE POLICY "products_admin_write" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ VARIANTS ============
CREATE TABLE public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_variants_product ON public.product_variants(product_id);
GRANT SELECT ON public.product_variants TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.product_variants TO authenticated;
GRANT ALL ON public.product_variants TO service_role;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "variants_public_read" ON public.product_variants FOR SELECT TO anon, authenticated USING (is_active = true OR public.is_staff(auth.uid()));
CREATE POLICY "variants_admin_write" ON public.product_variants FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_variants_updated BEFORE UPDATE ON public.product_variants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ BRANCH AVAILABILITY ============
CREATE TABLE public.product_branch_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  is_available BOOLEAN NOT NULL DEFAULT true,
  out_of_stock BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, branch_id)
);
GRANT SELECT ON public.product_branch_availability TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.product_branch_availability TO authenticated;
GRANT ALL ON public.product_branch_availability TO service_role;
ALTER TABLE public.product_branch_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pba_public_read" ON public.product_branch_availability FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "pba_admin_write" ON public.product_branch_availability FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_pba_updated BEFORE UPDATE ON public.product_branch_availability FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ ADDRESSES ============
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT,
  address TEXT NOT NULL,
  area TEXT,
  landmark TEXT,
  instructions TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.addresses TO authenticated;
GRANT ALL ON public.addresses TO service_role;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "addresses_own_all" ON public.addresses FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_addresses_updated BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ ORDERS ============
CREATE SEQUENCE public.order_number_seq START 10001;

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  fulfillment public.fulfillment_type NOT NULL,
  delivery_address TEXT,
  delivery_area TEXT,
  delivery_landmark TEXT,
  delivery_instructions TEXT,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  delivery_charge NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method public.payment_method NOT NULL DEFAULT 'cod',
  payment_status public.payment_status NOT NULL DEFAULT 'unpaid',
  status public.order_status NOT NULL DEFAULT 'pending',
  customer_notes TEXT,
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_branch ON public.orders(branch_id);
CREATE INDEX idx_orders_created ON public.orders(created_at DESC);
GRANT SELECT ON public.orders TO authenticated;
GRANT UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_own_select" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_staff(auth.uid()));
CREATE POLICY "orders_staff_update" ON public.orders FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  variant_name TEXT,
  unit_price NUMERIC(10,2) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  subtotal NUMERIC(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
GRANT SELECT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items_own_select" ON public.order_items FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_staff(auth.uid()))));

-- ============ RESERVATIONS ============
CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  guests INT NOT NULL CHECK (guests > 0),
  special_request TEXT,
  status public.reservation_status NOT NULL DEFAULT 'pending',
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.reservations TO authenticated;
GRANT INSERT ON public.reservations TO anon;
GRANT ALL ON public.reservations TO service_role;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reservations_public_insert" ON public.reservations FOR INSERT TO anon, authenticated WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "reservations_select" ON public.reservations FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_staff(auth.uid()));
CREATE POLICY "reservations_staff_update" ON public.reservations FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_reservations_updated BEFORE UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ CATERING ============
CREATE TABLE public.catering_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  branch_id UUID REFERENCES public.branches(id),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  guests INT,
  event_type TEXT,
  venue TEXT,
  service_type TEXT,
  requirements TEXT,
  notes TEXT,
  status public.catering_status NOT NULL DEFAULT 'pending',
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.catering_requests TO authenticated;
GRANT INSERT ON public.catering_requests TO anon;
GRANT ALL ON public.catering_requests TO service_role;
ALTER TABLE public.catering_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "catering_public_insert" ON public.catering_requests FOR INSERT TO anon, authenticated WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "catering_select" ON public.catering_requests FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_staff(auth.uid()));
CREATE POLICY "catering_staff_update" ON public.catering_requests FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_catering_updated BEFORE UPDATE ON public.catering_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ SITE SETTINGS ============
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_public_read" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "settings_admin_write" ON public.site_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ SECURE ORDER PLACEMENT ============
CREATE OR REPLACE FUNCTION public.place_order(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_branch public.branches%ROWTYPE;
  v_order_id UUID;
  v_order_number TEXT;
  v_item JSONB;
  v_product public.products%ROWTYPE;
  v_variant public.product_variants%ROWTYPE;
  v_unit_price NUMERIC(10,2);
  v_qty INT;
  v_subtotal NUMERIC(10,2) := 0;
  v_delivery NUMERIC(10,2) := 0;
  v_fulfillment public.fulfillment_type;
  v_name TEXT;
  v_phone TEXT;
  v_variant_name TEXT;
BEGIN
  v_name := trim(coalesce(payload->>'customer_name',''));
  v_phone := trim(coalesce(payload->>'customer_phone',''));
  IF length(v_name) < 2 THEN RAISE EXCEPTION 'Customer name is required'; END IF;
  IF length(v_phone) < 7 THEN RAISE EXCEPTION 'A valid phone number is required'; END IF;

  SELECT * INTO v_branch FROM public.branches WHERE id = (payload->>'branch_id')::UUID AND is_active = true;
  IF NOT FOUND THEN RAISE EXCEPTION 'Please select a valid branch'; END IF;

  v_fulfillment := (payload->>'fulfillment')::public.fulfillment_type;
  IF v_fulfillment = 'delivery' AND length(trim(coalesce(payload->>'delivery_address',''))) < 5 THEN
    RAISE EXCEPTION 'A delivery address is required';
  END IF;

  IF jsonb_array_length(coalesce(payload->'items','[]'::jsonb)) = 0 THEN
    RAISE EXCEPTION 'Your cart is empty';
  END IF;

  v_order_number := 'AS-' || nextval('public.order_number_seq')::TEXT;

  INSERT INTO public.orders (
    order_number, user_id, branch_id, customer_name, customer_phone, customer_email,
    fulfillment, delivery_address, delivery_area, delivery_landmark, delivery_instructions,
    payment_method, customer_notes
  ) VALUES (
    v_order_number, auth.uid(), v_branch.id, v_name, v_phone, nullif(trim(coalesce(payload->>'customer_email','')),''),
    v_fulfillment,
    CASE WHEN v_fulfillment = 'delivery' THEN payload->>'delivery_address' ELSE NULL END,
    CASE WHEN v_fulfillment = 'delivery' THEN payload->>'delivery_area' ELSE NULL END,
    CASE WHEN v_fulfillment = 'delivery' THEN payload->>'delivery_landmark' ELSE NULL END,
    CASE WHEN v_fulfillment = 'delivery' THEN payload->>'delivery_instructions' ELSE NULL END,
    CASE WHEN v_fulfillment = 'delivery' THEN 'cod'::public.payment_method ELSE 'cop'::public.payment_method END,
    nullif(trim(coalesce(payload->>'customer_notes','')),'')
  ) RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(payload->'items')
  LOOP
    SELECT * INTO v_product FROM public.products WHERE id = (v_item->>'product_id')::UUID AND is_active = true;
    IF NOT FOUND THEN RAISE EXCEPTION 'One of the items is no longer available'; END IF;

    v_qty := greatest(1, coalesce((v_item->>'quantity')::INT, 1));
    v_variant_name := NULL;

    IF v_item->>'variant_id' IS NOT NULL AND v_item->>'variant_id' <> '' THEN
      SELECT * INTO v_variant FROM public.product_variants
        WHERE id = (v_item->>'variant_id')::UUID AND product_id = v_product.id AND is_active = true;
      IF NOT FOUND THEN RAISE EXCEPTION 'Selected option for % is unavailable', v_product.name; END IF;
      v_unit_price := v_variant.price;
      v_variant_name := v_variant.name;
      INSERT INTO public.order_items (order_id, product_id, variant_id, item_name, variant_name, unit_price, quantity, subtotal, notes)
      VALUES (v_order_id, v_product.id, v_variant.id, v_product.name, v_variant_name, v_unit_price, v_qty, v_unit_price * v_qty, nullif(trim(coalesce(v_item->>'notes','')),''));
    ELSE
      IF v_product.base_price IS NULL THEN RAISE EXCEPTION 'Please choose an option for %', v_product.name; END IF;
      v_unit_price := v_product.base_price;
      INSERT INTO public.order_items (order_id, product_id, variant_id, item_name, variant_name, unit_price, quantity, subtotal, notes)
      VALUES (v_order_id, v_product.id, NULL, v_product.name, NULL, v_unit_price, v_qty, v_unit_price * v_qty, nullif(trim(coalesce(v_item->>'notes','')),''));
    END IF;

    v_subtotal := v_subtotal + (v_unit_price * v_qty);
  END LOOP;

  IF v_fulfillment = 'delivery' THEN
    v_delivery := coalesce(v_branch.delivery_fee, 0);
  END IF;

  UPDATE public.orders
     SET subtotal = v_subtotal, delivery_charge = v_delivery, total = v_subtotal + v_delivery
   WHERE id = v_order_id;

  RETURN jsonb_build_object(
    'order_number', v_order_number,
    'order_id', v_order_id,
    'subtotal', v_subtotal,
    'delivery_charge', v_delivery,
    'total', v_subtotal + v_delivery
  );
END; $$;
GRANT EXECUTE ON FUNCTION public.place_order(JSONB) TO anon, authenticated;

-- ============ PUBLIC ORDER TRACKING ============
CREATE OR REPLACE FUNCTION public.track_order(_order_number TEXT, _phone TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_items JSONB;
  v_branch_name TEXT;
BEGIN
  SELECT * INTO v_order FROM public.orders
   WHERE upper(order_number) = upper(trim(_order_number))
     AND regexp_replace(customer_phone,'[^0-9]','','g') = regexp_replace(trim(_phone),'[^0-9]','','g');
  IF NOT FOUND THEN RETURN NULL; END IF;

  SELECT name INTO v_branch_name FROM public.branches WHERE id = v_order.branch_id;

  SELECT coalesce(jsonb_agg(jsonb_build_object(
      'item_name', item_name, 'variant_name', variant_name,
      'quantity', quantity, 'unit_price', unit_price, 'subtotal', subtotal
    ) ORDER BY created_at), '[]'::jsonb)
    INTO v_items FROM public.order_items WHERE order_id = v_order.id;

  RETURN jsonb_build_object(
    'order_number', v_order.order_number,
    'status', v_order.status,
    'fulfillment', v_order.fulfillment,
    'branch_name', v_branch_name,
    'customer_name', v_order.customer_name,
    'subtotal', v_order.subtotal,
    'delivery_charge', v_order.delivery_charge,
    'total', v_order.total,
    'payment_method', v_order.payment_method,
    'created_at', v_order.created_at,
    'items', v_items
  );
END; $$;
GRANT EXECUTE ON FUNCTION public.track_order(TEXT, TEXT) TO anon, authenticated;

-- ============ SEED: BRANCHES & SETTINGS ============
INSERT INTO public.branches (slug, name, short_name, area, city, sort_order) VALUES
  ('neval-hub-river-road', 'Neval Hub River Road', 'Neval Hub', 'River Road', NULL, 1),
  ('metroville-site-area', 'Metroville SITE Area, Karachi', 'Metroville', 'Metroville SITE Area', 'Karachi', 2);

INSERT INTO public.site_settings (key, value, description) VALUES
  ('delivery_fee_default', '0', 'Default delivery charge in PKR (per branch fee overrides this)'),
  ('order_phone', '0348-0238699', 'Home delivery contact number from the printed menu'),
  ('whatsapp_number', '923480238699', 'WhatsApp number in international format'),
  ('online_payment_enabled', 'false', 'Enable online payment gateway once credentials are configured'),
  ('brand_slogan', 'No Compromise on Taste', 'Main brand slogan'),
  ('brand_tagline', 'The taste of TRADITION', 'Secondary premium marketing statement');