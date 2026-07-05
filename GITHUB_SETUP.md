# Jak opublikować Amberflo na GitHub Pages

GitHub Pages może bezpłatnie opublikować pliki HTML, CSS i JavaScript z publicznego repozytorium. W projekcie jest już gotowy automat `.github/workflows/pages.yml`, który publikuje stronę po każdej zmianie wysłanej na gałąź `main`.

## Najłatwiejsza metoda: GitHub Desktop

1. Załóż konto na [github.com](https://github.com) i zainstaluj [GitHub Desktop](https://desktop.github.com/).
2. W GitHub Desktop wybierz **File → Add local repository**.
3. Wskaż folder:

   `C:\Users\Daniel i Pati\Desktop\Strona internetowa bursztyn`

4. Jeżeli program zaproponuje utworzenie repozytorium, wybierz **Create a repository**.
5. Nazwij je np. `amberflo` i zatwierdź.
6. W lewym dolnym rogu wpisz opis zmiany, np. `Pierwsza wersja sklepu`, i wybierz **Commit to main**.
7. Kliknij **Publish repository**. Przy darmowym GitHub Pages repozytorium powinno być publiczne — odznacz **Keep this code private**.
8. Na stronie repozytorium wejdź w **Settings → Pages** i jako **Source** wybierz **GitHub Actions**.
9. Po kilku minutach adres strony pojawi się w **Settings → Pages**. Będzie podobny do:

   `https://TWOJ-LOGIN.github.io/amberflo/`

Każda następna zmiana wymaga tylko **Commit to main** i **Push origin** w GitHub Desktop. Publikacja wykona się automatycznie.

## Gdzie ręcznie zmieniać produkty

Cały katalog znajduje się w pliku `products.js`.

- `price: 378` — cena w złotych;
- `name.pl` i `name.en` — nazwa polska i angielska;
- `desc.pl` i `desc.en` — opisy;
- `image` — główne zdjęcie kafelka;
- `gallery` — lista zdjęć przewijanych strzałkami;
- usunięcie całego bloku produktu `{ ... }` usuwa produkt ze strony.

Nowe zdjęcie skopiuj najpierw do folderu `assets`, np. `assets/nowe-drzewko.webp`, a potem wpisz tę ścieżkę w `image` i `gallery`.

Po skonfigurowaniu Supabase ręczna edycja `products.js` nie będzie potrzebna — panel `admin.html` zapisuje katalog w bazie i te dane mają pierwszeństwo.

## Ważne: Supabase, Stripe i Resend

GitHub Pages publikuje wyłącznie stronę. Funkcje płatności i e-maili pozostają w Supabase.

- Publiczny klucz `anon` Supabase może znajdować się w `config.js`.
- Nigdy nie umieszczaj na GitHubie kluczy `service_role`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` ani `RESEND_API_KEY`.
- Sekrety ustawiaj wyłącznie w Supabase.
- Po publikacji ustaw sekret `SITE_URL` funkcji Supabase na adres GitHub Pages, np. `https://TWOJ-LOGIN.github.io/amberflo`.

## Własna domena

Później można podłączyć własną domenę, np. `amberflo.pl`, w **Settings → Pages → Custom domain**. Wymaga to również ustawienia rekordów DNS u operatora domeny.
