# Ladwannou — Entegrasyon MonCashConnect (don volontè)

## ⚠️ Enpòtan pou konprann anvan w kòmanse

MonCashConnect **se pa** Digicel/MonCash ofisyèl — se yon pasrèl (gateway) tyès pati endepandan ki fasilite peman MonCash pou devlopè. Yo pran yon komisyon sou chak tranzaksyon (verifye pousantaj egzat la nan dashboard ou, paske nou jwenn de chif diferan pandan rechèch nou: 3%/1.5% nan yon atik blog, ak "zero commission, men frè depo/retrè soti nan founisè tyès pati" sou paj akèy la — konfime sa dirèkteman sou kont ou anvan w kòmanse).

## Poukisa yon dezyèm sit deplwaye?

Sit prensipal la (`www.ladwannou.online`) rete sou GitHub Pages, ki sèlman sèvi fichye estatik. Kle sekrè MonCashConnect la (`sk_proj_...`) dwe rete kache sou yon sèvè — GitHub Pages pa ka fè sa. Solisyon an: de ti fonksyon deplwaye sou Netlify, sit prensipal la rele yo lè yon moun vle fè yon don.

## Etap 1 — Kreye kont MonCashConnect

1. Ale sou `https://moncashconnect.com`
2. Kreye yon kont gratis (pa gen dokiman ki mande, pa gen validasyon manyèl)
3. Kreye yon pwojè nan **Developer → Projects**
4. Kopye **Secret Key** ou:
   - `sk_test_proj_...` pou tès (sandbox — pa gen vrè lajan)
   - `sk_proj_...` pou vrè peman (live)

## Etap 2 — Deplwaye backend la sou Netlify

1. Ale sou [netlify.com](https://netlify.com), konekte
2. **Add new site → Deploy manually**
3. Glise-depoze **tout dosye `ladwannou-stripe`** a (li gen `netlify.toml`, `package.json`, `netlify/functions/`, ak `public/`)
4. Netlify ap enstale SDK MonCashConnect otomatikman, epi ba w yon URL tankou `https://yon-non-owaza.netlify.app`

## Etap 3 — Konfigire kle a

1. Nan Netlify: **Site settings → Environment variables**
2. Ajoute:
   - `MCC_SECRET_KEY` = kle sekrè w la (kòmanse ak sonde tès `sk_test_proj_...`)
3. Re-deplwaye (Netlify fè sa otomatikman apre w ajoute yon varyab)

## Etap 4 — Konekte sit prensipal la

Nan `index.html`, chèche liy sa a:
```js
const MONCASH_API_BASE = 'https://REPLACE-WITH-YOUR-NETLIFY-SITE.netlify.app/.netlify/functions';
```
Ranplase `REPLACE-WITH-YOUR-NETLIFY-SITE` ak vrè non sit Netlify w lan. Sove, monte `index.html` sou GitHub ankò.

## Etap 5 — Teste (sandbox)

Ak yon kle `sk_test_proj_...`, eseye fè yon "don" tès — pa gen vrè lajan ki sikile. Verifye tout chemen an: antre montan → "Peye ak MonCash" → paj MonCashConnect → retounen sou sit la → mesaj konfimasyon.

## Etap 6 — Pase an "live"

1. Retounen nan dashboard MonCashConnect ou, jwenn kle **live** ou (`sk_proj_...`)
2. Ranplase valè `MCC_SECRET_KEY` nan Netlify ak nouvo kle live la
3. Verifye pousantaj komisyon egzat ki aplike sou kont ou anvan w fè piblisite pou fonksyon don an

## Bagay pou sonje

- CORS konfigire sèlman pou `https://www.ladwannou.online`
- Tout montan yo an **HTG** (Goud)
- Sa se yon platfòm ki poko gen anpil istwa piblik (kreye resamman) — swiv balans/retrè ou regilyèman nan premye semèn yo pou konfime tout bagay ap mache jan w atann
