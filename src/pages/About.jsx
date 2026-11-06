import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <p className="eyebrow">ABOUT BLOOM</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight">Бидний тухай</h1>
      <div className="mt-8 space-y-5 leading-relaxed text-ink/80">
        <p>Монголд гоо сайхны бүтээгдэхүүнийг ихэвчлэн сошиал хуудсаар зарж, үнэ, нөөц, жинхэнэ эсэх нь тодорхойгүй, захиалгын явцыг хянах боломжгүй байдаг.</p>
        <p><strong>Bloom Beauty</strong> нь брэнд, ангилал, үнээр хайж харьцуулах, сэтгэгдэл унших, сагсаар захиалж, захиалгын төлвөө хянах боломжтой онлайн дэлгүүр юм. Дэлгүүр эрхлэгч админ самбараас бүтээгдэхүүн, нөөц, захиалгаа нэг дороос удирдана.</p>
      </div>
      <Link to="/products" className="btn-primary mt-10">Дэлгүүр хэсэх</Link>
    </div>
  )
}
