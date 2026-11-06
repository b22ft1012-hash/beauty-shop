-- =============================================================
-- Bloom Beauty — өгөгдлийн сангийн бүтэц, RLS, Storage
-- Supabase SQL Editor дээр нэг удаа ажиллуулна.
-- 8 хүснэгт · 1:N холбоо (brands/categories → products, profiles → orders, ...)
-- N:M холбоо: orders ↔ products (order_items), profiles ↔ products (favorites)
-- =============================================================

-- ---------- 1. Хүснэгтүүд ----------
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  phone text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz default now()
);

create table categories (
  id bigint generated always as identity primary key,
  name text not null unique,
  image_url text
);

create table brands (
  id bigint generated always as identity primary key,
  name text not null unique
);

create table products (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 2 and 120),
  subtitle text,
  description text,
  category_id bigint not null references categories(id),
  brand_id bigint references brands(id),
  price integer not null check (price > 0),
  old_price integer check (old_price is null or old_price > price),
  stock integer not null default 0 check (stock >= 0),
  image_url text,
  tag text,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

create table orders (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'paid', 'shipped', 'cancelled')),
  total integer not null check (total >= 0),
  phone text not null,
  address text not null,
  created_at timestamptz default now()
);

-- N:M — нэг захиалгад олон бүтээгдэхүүн, нэг бүтээгдэхүүн олон захиалгад
create table order_items (
  order_id bigint references orders(id) on delete cascade,
  product_id bigint references products(id),
  quantity integer not null check (quantity > 0),
  unit_price integer not null check (unit_price > 0),
  primary key (order_id, product_id)
);

-- N:M — хэрэглэгчийн хүслийн жагсаалт
create table favorites (
  user_id uuid references profiles(id) on delete cascade,
  product_id bigint references products(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, product_id)
);

create table reviews (
  id bigint generated always as identity primary key,
  product_id bigint not null references products(id) on delete cascade,
  user_id uuid not null default auth.uid() references profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text check (char_length(comment) <= 500),
  created_at timestamptz default now(),
  unique (product_id, user_id)
);

-- Жагсаалтад харуулах view: брэнд, ангиллын нэр болон дундаж үнэлгээтэй
-- security_invoker = true тул products хүснэгтийн RLS энд мөн үйлчилнэ
create or replace view product_list with (security_invoker = true) as
select p.*,
       b.name as brand_name,
       c.name as category_name,
       round(avg(r.rating), 1) as avg_rating,
       count(r.id)::int as review_count
from products p
join categories c on c.id = p.category_id
left join brands b on b.id = p.brand_id
left join reviews r on r.product_id = p.id
group by p.id, b.name, c.name;

-- ---------- 2. Бүртгүүлэхэд profile автоматаар үүсгэх ----------
create function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name) values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users for each row execute function public.handle_new_user();

-- ---------- 3. Админ эсэхийг шалгах ----------
create function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- ---------- 4. Захиалга үүсгэх (үнийг сервер талд тооцоолно) ----------
-- Frontend-ээс зөвхөн бүтээгдэхүүний id, тоо ширхэг ирнэ. Үнийг өгөгдлийн сангаас авдаг тул
-- хэрэглэгч үнийг гараар өөрчилж чадахгүй. Нөөц хүрэлцэхгүй бол алдаа буцаана.
create function public.create_order(items jsonb, p_phone text, p_address text)
returns bigint language plpgsql security definer set search_path = public as $$
declare
  v_order_id bigint;
  v_total integer := 0;
  item jsonb;
  v_product products%rowtype;
  v_qty integer;
begin
  if auth.uid() is null then raise exception 'Нэвтэрсэн байх шаардлагатай'; end if;
  if jsonb_array_length(items) = 0 then raise exception 'Сагс хоосон байна'; end if;
  if char_length(trim(p_phone)) < 8 then raise exception 'Утасны дугаар буруу'; end if;
  if char_length(trim(p_address)) < 5 then raise exception 'Хаягаа бүрэн оруулна уу'; end if;

  insert into orders (user_id, total, phone, address)
  values (auth.uid(), 0, trim(p_phone), trim(p_address)) returning id into v_order_id;

  for item in select * from jsonb_array_elements(items) loop
    v_qty := (item->>'quantity')::int;
    select * into v_product from products where id = (item->>'product_id')::bigint and is_active for update;
    if not found then raise exception 'Бүтээгдэхүүн олдсонгүй'; end if;
    if v_qty < 1 or v_qty > v_product.stock then raise exception '% — нөөц хүрэлцэхгүй байна', v_product.name; end if;

    insert into order_items (order_id, product_id, quantity, unit_price)
    values (v_order_id, v_product.id, v_qty, v_product.price);
    update products set stock = stock - v_qty where id = v_product.id;
    v_total := v_total + v_product.price * v_qty;
  end loop;

  update orders set total = v_total where id = v_order_id;
  return v_order_id;
end;
$$;

-- ---------- 5. Row Level Security (бүх хүснэгтэд) ----------
alter table profiles enable row level security;
alter table categories enable row level security;
alter table brands enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table favorites enable row level security;
alter table reviews enable row level security;

-- profiles: өөрийнхөө эсвэл админ харна; зөвхөн нэр, утсаа засна (role-оо биш)
create policy profiles_select on profiles for select using (id = auth.uid() or is_admin());
create policy profiles_update on profiles for update using (id = auth.uid());
revoke update on profiles from authenticated, anon;
grant update (full_name, phone) on profiles to authenticated;

-- categories, brands: хүн бүр уншина, админ удирдана
create policy categories_select on categories for select using (true);
create policy categories_admin on categories for all using (is_admin()) with check (is_admin());
create policy brands_select on brands for select using (true);
create policy brands_admin on brands for all using (is_admin()) with check (is_admin());

-- products: идэвхтэйг хүн бүр харна, админ бүгдийг харж удирдана
create policy products_select on products for select using (is_active or is_admin());
create policy products_admin on products for all using (is_admin()) with check (is_admin());

-- orders: өөрийн захиалгаа харна; шинэ захиалга зөвхөн create_order()-оор; төлвийг админ өөрчилнө
create policy orders_select on orders for select using (user_id = auth.uid() or is_admin());
create policy orders_admin_update on orders for update using (is_admin()) with check (is_admin());

-- order_items: өөрийн захиалгын мөрийг харна
create policy order_items_select on order_items for select
  using (exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_admin())));

-- favorites: хэрэглэгч зөвхөн өөрийн жагсаалтаа удирдана
create policy favorites_own on favorites for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- reviews: хүн бүр уншина; өөрийн нэрээр бичнэ; өөрийнхөө эсвэл админ устгана
create policy reviews_select on reviews for select using (true);
create policy reviews_insert on reviews for insert to authenticated with check (user_id = auth.uid());
create policy reviews_update on reviews for update using (user_id = auth.uid());
create policy reviews_delete on reviews for delete using (user_id = auth.uid() or is_admin());

-- Сэтгэгдлийг бичсэн хүний нэртэй нь харуулах view.
-- profiles хүснэгт нь бусдад хаалттай тул view зөвхөн нэрийг (утас, role биш) ил гаргана.
create view review_list as
select r.id, r.product_id, r.user_id, r.rating, r.comment, r.created_at,
       coalesce(nullif(p.full_name, ''), 'Хэрэглэгч') as reviewer
from reviews r join profiles p on p.id = r.user_id;
grant select on review_list to anon, authenticated;

grant execute on function public.create_order(jsonb, text, text) to authenticated;

-- ---------- 6. Storage: 'product-images' public bucket ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy product_images_admin on storage.objects for all to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());
