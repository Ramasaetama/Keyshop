DO $$ DECLARE t text; BEGIN FOREACH t IN ARRAY ARRAY['products','product_items','variations','variation_options'] LOOP EXECUTE format('SELECT setval(pg_get_serial_sequence(%L, ''id''), greatest(coalesce(max(id),0)+1,1), false) FROM public.%I','public.'||t,t); END LOOP; END $$;
CREATE OR REPLACE FUNCTION public.admin_save_product(_payload jsonb) RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE pid integer; vid integer; iid integer; optid integer; rowdata jsonb;
BEGIN
 IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Akses admin diperlukan'; END IF;
 IF coalesce(length(trim(_payload->>'name')),0)=0 OR jsonb_array_length(_payload->'items') < 1 THEN RAISE EXCEPTION 'Produk dan varian wajib diisi'; END IF;
 pid := (_payload->>'id')::integer;
 IF pid IS NULL THEN
  INSERT INTO public.products(name,description,category_id,image_url,tag,is_deal) VALUES(trim(_payload->>'name'),_payload->>'description',(_payload->>'category_id')::integer,_payload->>'image_url',_payload->>'tag',(_payload->>'is_deal')::boolean) RETURNING id INTO pid;
 ELSE
  PERFORM 1 FROM public.products WHERE id=pid FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Produk tidak ditemukan'; END IF;
  UPDATE public.products SET name=trim(_payload->>'name'),description=_payload->>'description',category_id=(_payload->>'category_id')::integer,image_url=_payload->>'image_url',tag=_payload->>'tag',is_deal=(_payload->>'is_deal')::boolean WHERE id=pid;
 END IF;
 IF (SELECT count(*) FROM public.variations WHERE product_id=pid)>1 THEN RAISE EXCEPTION 'Produk memiliki beberapa jenis opsi; konfigurasi tidak boleh ditimpa'; END IF;
 SELECT id INTO vid FROM public.variations WHERE product_id=pid LIMIT 1;
 IF vid IS NULL THEN INSERT INTO public.variations(product_id,name) VALUES(pid,_payload->>'variation_name') RETURNING id INTO vid;
 ELSE UPDATE public.variations SET name=_payload->>'variation_name' WHERE id=vid; END IF;
 IF EXISTS(SELECT 1 FROM public.product_items pi WHERE pi.product_id=pid AND NOT EXISTS(SELECT 1 FROM jsonb_array_elements(_payload->'items') j WHERE (j->>'id')::integer=pi.id)) THEN RAISE EXCEPTION 'Varian lama tidak boleh dihapus; ubah stok menjadi nol'; END IF;
 FOR rowdata IN SELECT * FROM jsonb_array_elements(_payload->'items') LOOP
  IF (rowdata->>'qty_in_stock')::numeric<0 OR (rowdata->>'qty_in_stock')::numeric<>trunc((rowdata->>'qty_in_stock')::numeric) OR (rowdata->>'price')::numeric<0 THEN RAISE EXCEPTION 'Harga dan stok tidak valid'; END IF;
  iid := (rowdata->>'id')::integer;
  IF iid IS NULL THEN INSERT INTO public.product_items(product_id,sku,price,qty_in_stock) VALUES(pid,trim(rowdata->>'sku'),(rowdata->>'price')::numeric,(rowdata->>'qty_in_stock')::integer) RETURNING id INTO iid;
  ELSE
   PERFORM 1 FROM public.product_items WHERE id=iid AND product_id=pid FOR UPDATE;
   IF NOT FOUND THEN RAISE EXCEPTION 'Varian bukan milik produk ini'; END IF;
   UPDATE public.product_items SET sku=trim(rowdata->>'sku'),price=(rowdata->>'price')::numeric,qty_in_stock=(rowdata->>'qty_in_stock')::integer WHERE id=iid;
  END IF;
  SELECT vo.id INTO optid FROM public.product_configurations pc JOIN public.variation_options vo ON vo.id=pc.variation_option_id WHERE pc.product_item_id=iid AND vo.variation_id=vid LIMIT 1;
  IF optid IS NULL THEN
   INSERT INTO public.variation_options(variation_id,value) VALUES(vid,trim(rowdata->>'variant')) RETURNING id INTO optid;
   INSERT INTO public.product_configurations(product_item_id,variation_option_id) VALUES(iid,optid);
  ELSE UPDATE public.variation_options SET value=trim(rowdata->>'variant') WHERE id=optid; END IF;
 END LOOP;
 RETURN pid;
END $$;
REVOKE ALL ON FUNCTION public.admin_save_product(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_save_product(jsonb) TO authenticated;