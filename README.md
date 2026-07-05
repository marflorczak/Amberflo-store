# Amberflo — sklep internetowy

Gotowy, responsywny sklep w języku polskim i angielskim. Koszyk działa od razu w przeglądarce. Formularz opinii i zamówienie przelewem mają bezpieczny tryb zastępczy przez e-mail; płatności online i automatyczne powiadomienia zaczynają działać po podłączeniu kont.

Sklep zawiera galerie produktów ze strzałkami i miniaturami oraz dokumenty: `regulamin.html`, `polityka-prywatnosci.html` i `dostawa-i-zwroty.html`. Dokumenty uwzględniają obecne funkcje projektu, ale przed publikacją produkcyjną powinny zostać zatwierdzone przez właściciela i — dla pełnego bezpieczeństwa — prawnika.

Prywatne zaplecze znajduje się w `admin.html`. Umożliwia zarządzanie produktami, cenami, opisami, galeriami i opiniami. Konfigurację pierwszego konta administratora opisuje `ADMIN_SETUP.md`.

Katalog do ręcznej edycji znajduje się w `products.js`. Gotową instrukcję publikacji przez GitHub Desktop i GitHub Pages zawiera `GITHUB_SETUP.md`.

## Uruchomienie lokalne

W tym folderze uruchom prosty serwer, na przykład:

```powershell
python -m http.server 8000
```

Następnie otwórz `http://localhost:8000`.

## Supabase i opinie

1. Utwórz projekt w Supabase.
2. W SQL Editor uruchom plik `supabase/schema.sql`.
3. W `config.js` wpisz adres projektu i publiczny klucz `anon`.
4. W tabeli `reviews` zmieniaj `status` z `pending` na `approved`, aby opublikować opinię.

## Resend — powiadomienia e-mail

W panelu Resend dodaj i zweryfikuj domenę nadawczą. Następnie ustaw sekrety funkcji Supabase:

```powershell
supabase secrets set RESEND_API_KEY=re_... OWNER_EMAIL=biuroamberflo@gmail.com FROM_EMAIL="Amberflo <zamowienia@twoja-domena.pl>"
supabase functions deploy notify
```

Klucz Resend pozostaje wyłącznie po stronie serwera — nie wpisuj go do `config.js`.

### Darmowy wariant bez własnej domeny

Adres GitHub Pages nie jest domeną nadawczą poczty. Bez własnej domeny Resend pozwala wysyłać wiadomości tylko na adres przypisany do konta Resend. Ustaw wtedy:

```text
OWNER_EMAIL=biuroamberflo@gmail.com
FROM_EMAIL=Amberflo <onboarding@resend.dev>
SEND_CUSTOMER_EMAILS=false
```

Konto Resend musi być założone na `biuroamberflo@gmail.com`. Sklep wyśle powiadomienia o zamówieniach i opiniach do Amberflo, ale nie wyśle jeszcze potwierdzenia do klienta. Po zakupie własnej domeny ustaw jej adres w `FROM_EMAIL` oraz zmień `SEND_CUSTOMER_EMAILS` na `true`.

## Płatności kartą, BLIK i Przelewy24

Najprostsze rozwiązanie to Stripe Checkout. Po założeniu konta Stripe ustaw:

```powershell
supabase secrets set STRIPE_SECRET_KEY=sk_... SITE_URL=https://adres-twojej-strony.pl
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook --no-verify-jwt
```

W Stripe dodaj endpoint webhooka `https://ID-PROJEKTU.supabase.co/functions/v1/stripe-webhook`, zaznacz zdarzenie `checkout.session.completed`, a otrzymany sekret ustaw poleceniem `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...`. Webhook oznaczy zamówienie jako opłacone i wyśle przez Resend wiadomość do Amberflo oraz klienta.

Przed uruchomieniem sprzedaży trzeba też dodać regulamin sklepu, politykę prywatności, zasady dostawy/zwrotów i pełne dane rejestrowe firmy.

## Produkty

Katalog znajduje się na początku `app.js`. Ceny i opisy zostały przygotowane na podstawie publicznych ofert sprzedawcy `marflorczak` w Allegro. Allegro nie jest połączone ze sklepem, więc stany magazynowe i późniejsze zmiany cen trzeba aktualizować ręcznie albo przez osobną integrację API.
