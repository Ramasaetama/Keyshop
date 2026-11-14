insert into public.order_statuses (id, name) values (4, 'Belum Bayar'), (5, 'Dibatalkan'), (6, 'Pengembalian Barang') on conflict (id) do nothing;

alter table public.shop_orders
  add column if not exists payment_status text not null default 'paid',
  add column if not exists payment_id text,
  add column if not exists paid_at timestamptz,
  add column if not exists currency text not null default 'USD',
  add column if not exists courier text,
  add column if not exists tracking_number text,
  add column if not exists shipped_at timestamptz;
alter table public.shop_orders add constraint shop_orders_payment_status_check check (payment_status in ('pending','paid','expired','refunded'));
alter table public.order_lines add column if not exists base_price numeric(10,2);

update public.shop_orders set payment_id = 'PAY-' || upper(substr(replace(id::text,'-',''),1,12)), paid_at = order_date where payment_id is null;
update public.order_lines l set base_price = pi.price from public.product_items pi where pi.id = l.product_item_id and l.base_price is null;

create or replace function public.order_defaults() returns trigger language plpgsql set search_path = public as $$
begin
  if new.payment_status = 'paid' then
    new.payment_id := coalesce(new.payment_id, 'PAY-' || upper(substr(replace(new.id::text,'-',''),1,12)));
    new.paid_at := coalesce(new.paid_at, now());
  end if;
  return new;
end $$;
create trigger shop_orders_defaults before insert on public.shop_orders for each row execute function public.order_defaults();

create or replace function public.line_base_price() returns trigger language plpgsql set search_path = public as $$
begin
  if new.base_price is null then select price into new.base_price from public.product_items where id = new.product_item_id; end if;
  return new;
end $$;
create trigger order_lines_base_price before insert on public.order_lines for each row execute function public.line_base_price();

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.shop_orders(id) on delete cascade,
  status_id int references public.order_statuses(id),
  payment_status text,
  note text not null default '',
  created_at timestamptz not null default now()
);
grant select on public.order_status_history to authenticated;
grant all on public.order_status_history to service_role;
alter table public.order_status_history enable row level security;
create policy "own or admin history" on public.order_status_history for select to authenticated
  using (exists (select 1 from public.shop_orders o where o.id = order_id and (o.user_id = auth.uid() or public.has_role(auth.uid(), 'admin'))));

insert into public.order_status_history (order_id, status_id, payment_status, note, created_at)
  select id, status_id, payment_status, 'Pesanan dibuat', order_date from public.shop_orders;

create or replace function public.log_order_status() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into public.order_status_history (order_id, status_id, payment_status, note) values (new.id, new.status_id, new.payment_status, 'Pesanan dibuat');
  elsif new.status_id is distinct from old.status_id or new.payment_status is distinct from old.payment_status then
    insert into public.order_status_history (order_id, status_id, payment_status, note)
    values (new.id, new.status_id, new.payment_status,
      case when new.tracking_number is distinct from old.tracking_number and new.tracking_number is not null then 'Resi ' || coalesce(new.courier,'') || ' ' || new.tracking_number else '' end);
  end if;
  return new;
end $$;
create trigger shop_orders_history after insert or update on public.shop_orders for each row execute function public.log_order_status();

create or replace function public.ship_order(_order uuid, _courier text, _tracking text)
returns void language plpgsql security definer set search_path = public as $$
declare o public.shop_orders;
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'Hanya admin'; end if;
  if coalesce(trim(_courier),'') = '' or coalesce(trim(_tracking),'') = '' then raise exception 'Kurir dan nomor resi wajib diisi'; end if;
  select * into o from public.shop_orders where id = _order for update;
  if not found then raise exception 'Pesanan tidak ditemukan'; end if;
  if o.payment_status <> 'paid' or o.status_id <> 1 then raise exception 'Hanya pesanan lunas yang sedang dikemas yang bisa dikirim'; end if;
  update public.shop_orders set courier = trim(_courier), tracking_number = trim(_tracking), shipped_at = now(), status_id = 2 where id = _order;
end $$;
revoke execute on function public.ship_order(uuid, text, text) from public, anon;
grant execute on function public.ship_order(uuid, text, text) to authenticated;

create or replace function public.set_payment_status(_order uuid, _status text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'Hanya admin'; end if;
  if _status not in ('pending','paid','expired','refunded') then raise exception 'Status pembayaran tidak valid'; end if;
  update public.shop_orders set payment_status = _status,
    paid_at = case when _status = 'paid' then coalesce(paid_at, now()) else paid_at end,
    payment_id = case when _status = 'paid' then coalesce(payment_id, 'PAY-' || upper(substr(replace(id::text,'-',''),1,12))) else payment_id end
  where id = _order;
end $$;
revoke execute on function public.set_payment_status(uuid, text) from public, anon;
grant execute on function public.set_payment_status(uuid, text) to authenticated;

create policy "admin read profiles" on public.profiles for select to authenticated using (public.has_role(auth.uid(), 'admin'));