-- Bloom Beauty — жишээ өгөгдөл (demo). Зургууд: Unsplash (чөлөөт лиценз).
insert into categories (name, image_url) values
  ('Арьс арчилгаа', 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=850&q=85'),
  ('Нүүр будалт', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=850&q=85'),
  ('Үс арчилгаа', 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=850&q=85'),
  ('Үнэртэн', 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=850&q=85')
on conflict (name) do nothing;

insert into brands (name) values
  ('Glow Recipe'),
  ('The Ordinary'),
  ('Rare Beauty'),
  ('L''Occitane'),
  ('Olaplex'),
  ('Diptyque'),
  ('COSRX'),
  ('Laneige'),
  ('Fenty Beauty')
on conflict (name) do nothing;

insert into products (name, subtitle, description, category_id, brand_id, price, old_price, stock, image_url, tag)
select v.name, v.subtitle, v.description, c.id, b.id, v.price, v.old_price, v.stock, v.image_url, v.tag
from (values
  ('Watermelon Glow Serum', 'Чийгшүүлэгч нүүрний серум', 'Тарвас, гиалуроны хүчил агуулсан хөнгөн серум. Арьсыг чийгшүүлж, нүх сүвийг багасгана.', 'Арьс арчилгаа', 'Glow Recipe', 79000, 99000, 24, 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=850&q=85', 'BESTSELLER'),
  ('Niacinamide 10% + Zinc 1%', 'Арьсны тослог тэнцвэржүүлэгч', 'Ниацинамид болон цайр агуулсан серум. Тослогийг тэнцвэржүүлж, батга гарахаас сэргийлнэ.', 'Арьс арчилгаа', 'The Ordinary', 42000, null::int, 40, 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=850&q=85', 'NEW'),
  ('Soft Pinch Liquid Blush', 'Шингэн хацар өнгөлөгч', 'Нэг дусал хангалттай шингэн хацрын будаг. Удаан тогтоно, байгалийн өнгө өгнө.', 'Нүүр будалт', 'Rare Beauty', 68000, 85000, 18, 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=850&q=85', '-20%'),
  ('Shea Butter Hand Cream', 'Тэжээл өгөх гарын тос', '20% ши тос агуулсан, хуурай гарыг тэжээж зөөлрүүлнэ.', 'Арьс арчилгаа', 'L''Occitane', 55000, null::int, 30, 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=850&q=85', null),
  ('Bond Maintenance No.5', 'Үсний чийгшүүлэгч ангижруулагч', 'Гэмтсэн үсний бүтцийг сэргээж, гялалзуулна.', 'Үс арчилгаа', 'Olaplex', 92000, null::int, 15, 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=850&q=85', 'NEW'),
  ('Eau Rose Eau de Toilette', 'Цэцэгсийн зөөлөн үнэртэн', 'Сарнай, гүргэм, мускусын зөөлөн цэцэгсийн үнэртэн.', 'Үнэртэн', 'Diptyque', 189000, 220000, 8, 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=850&q=85', '-14%'),
  ('Advanced Snail Mucin Essence', 'Эмзэг арьсны эссенс', '96% эмгэн хумсны шүүрэл агуулсан, арьсыг сэргээж чийгшүүлнэ.', 'Арьс арчилгаа', 'COSRX', 48000, null::int, 35, 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=850&q=85', null),
  ('Lip Sleeping Mask', 'Шөнийн уруулын маск', 'Унтахын өмнө түрхэхэд өглөө уруул зөөлөн, чийглэг болно.', 'Арьс арчилгаа', 'Laneige', 38000, 45000, 50, 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=850&q=85', '-15%'),
  ('Gloss Bomb Lip Luminizer', 'Уруулын гялгар', 'Бүх арьсны өнгөнд тохирох гялалзсан уруулын будаг.', 'Нүүр будалт', 'Fenty Beauty', 59000, null::int, 22, 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=850&q=85', null),
  ('Perfect Strokes Mascara', 'Сормуусны будаг', 'Сормуусыг уртасгаж, өтгөрүүлнэ. Ус нэвтрэхгүй.', 'Нүүр будалт', 'Rare Beauty', 52000, null::int, 0, 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=850&q=85', null),
  ('No.3 Hair Perfector', 'Үсний арчилгааны эмчилгээ', 'Угаахын өмнө түрхдэг, үсний хугарлыг багасгах эмчилгээ.', 'Үс арчилгаа', 'Olaplex', 88000, 98000, 12, 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=850&q=85', '-10%'),
  ('Do Son Eau de Parfum', 'Цэцэгсийн парфюм', 'Туберозын цэцгийн сэтгэл татам, удаан тогтдог үнэр.', 'Үнэртэн', 'Diptyque', 245000, null::int, 5, 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=850&q=85', 'NEW')
) as v(name, subtitle, description, category, brand, price, old_price, stock, image_url, tag)
join categories c on c.name = v.category
join brands b on b.name = v.brand
where not exists (select 1 from products p where p.name = v.name);
