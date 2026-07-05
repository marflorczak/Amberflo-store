// ================================================================
// PRODUKTY AMBERFLO — tutaj można ręcznie zmieniać katalog.
// Po podłączeniu Supabase dane z panelu admin.html mają pierwszeństwo.
//
// image   = zdjęcie widoczne na kafelku produktu
// gallery = wszystkie zdjęcia widoczne po otwarciu produktu
// price   = cena w złotych, bez cudzysłowu
// category: small (małe), classic (klasyczne) lub large (duże)
// Aby ukryć produkt ręcznie, usuń jego cały blok { ... } z listy.
// ================================================================
window.AMBERFLO_PRODUCTS = [
  {
    id: 'szyszka-12',
    category: 'small',
    name: { pl: 'Bursztynowa szyszka', en: 'Amber pinecone' },
    price: 58,
    height: '11–12 cm', pieces: '50–60', width: '7–8 cm',
    image: '647ee3324afdb8d8820013c96e59.webp',
    gallery: ['647ee3324afdb8d8820013c96e59.webp', 'ba20276641c2b6a262ec2b774fff.webp'],
    badge: { pl: 'Na dobry początek', en: 'A perfect start' },
    desc: { pl: 'Mała forma, wielki blask. Stabilna drewniana podstawa.', en: 'A small form with a beautiful glow on a stable wooden base.' }
  },
  {
    id: 'drzewko-216',
    category: 'small',
    name: { pl: 'Drzewko 216 kamieni', en: '216-stone tree' },
    price: 218,
    height: '17 cm', pieces: '216', width: '—',
    image: 'assets/drzewko-216-glowne.webp',
    gallery: ['assets/drzewko-216-glowne.webp', 'assets/drzewko-216-skala.webp', 'assets/drzewko-216-detal.webp', 'assets/drzewko-216-wariant.webp'],
    badge: { pl: 'Bestseller', en: 'Bestseller' },
    desc: { pl: 'Subtelne drzewko na naturalnym korzeniu dębu lub mopani.', en: 'A delicate tree set on natural oak or mopani root.' }
  },
  {
    id: 'szyszka-zlota-20',
    category: 'classic',
    name: { pl: 'Szyszka złota', en: 'Golden pinecone' },
    price: 260,
    height: '20 cm', pieces: '350–400', width: '16–17 cm',
    image: 'assets/szyszka-zlota-20.webp',
    gallery: ['assets/szyszka-zlota-20.webp', 'ba20276641c2b6a262ec2b774fff.webp', '647ee3324afdb8d8820013c96e59.webp'],
    badge: { pl: 'Klasyk', en: 'Classic' },
    desc: { pl: 'Złota szyszka pokryta bursztynem w odcieniu koniakowym.', en: 'A golden pinecone covered with cognac-toned Baltic amber.' }
  },
  {
    id: 'drzewko-klasyczne-20',
    category: 'classic',
    name: { pl: 'Drzewko klasyczne', en: 'Classic amber tree' },
    price: 378,
    height: '20 cm', pieces: '432', width: '—',
    image: 'Drzewko-szczescia-BURSZTYN_prezent.webp',
    gallery: ['Drzewko-szczescia-BURSZTYN_prezent.webp', 'Drzewko-szczescia-BURSZTYN_prezent-Wysokosc-maksymalna-20-cm.webp', 'Drzewko-szczescia-BURSZTYN_prezent-Marka-bez-marki.webp', 'Drzewko-szczescia-BURSZTYN_prezent-Kod-producenta-bizuteria-prezent-bursztyn-dom-dekoracja.webp'],
    badge: { pl: 'Najczęściej wybierane', en: 'Most popular' },
    desc: { pl: '432 bryłki bursztynu na ręcznie modelowanych gałązkach.', en: '432 amber stones set on individually shaped branches.' }
  },
  {
    id: 'drzewko-premium-20',
    category: 'classic',
    name: { pl: 'Drzewko Premium', en: 'Premium amber tree' },
    price: 398,
    height: '20 cm', pieces: '432', width: '—',
    image: 'e019315a413d9b4eaec70e40b0ca.webp',
    gallery: ['e019315a413d9b4eaec70e40b0ca.webp', 'c32eb4ae42e7a621643233cc3711.webp', 'Drzewko-szczescia-BURSZTYN_prezent-Marka-bez-marki.webp'],
    badge: { pl: 'Unikatowa podstawa', en: 'Unique base' },
    desc: { pl: 'Pełna korona z bursztynu i starannie wybrana podstawa.', en: 'A full amber crown paired with a carefully selected base.' }
  },
  {
    id: 'drzewko-duze-25',
    category: 'large',
    name: { pl: 'Drzewko 648 kamieni', en: '648-stone tree' },
    price: 598,
    height: '25 cm', pieces: '648', width: '—',
    image: 'c32eb4ae42e7a621643233cc3711.webp',
    gallery: ['c32eb4ae42e7a621643233cc3711.webp', 'e019315a413d9b4eaec70e40b0ca.webp', 'assets/drzewko-216-glowne.webp'],
    badge: { pl: 'Okazałe', en: 'Statement piece' },
    desc: { pl: 'Okazała kompozycja do wnętrza lub na wyjątkowy prezent.', en: 'A statement composition for an interior or exceptional gift.' }
  }
];
