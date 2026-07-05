# Amberflo — uruchomienie dostaw, zamówień i Stripe

## 1. Rozbudowa bazy

W Supabase otwórz **SQL Editor → New query**, wklej cały plik:

`supabase/shipping-orders-upgrade.sql`

i kliknij **Run**. Powstaną cztery metody dostawy, dodatkowe pola zamówień oraz bezpieczny dostęp administratora.

## 2. Wdrożenie funkcji

W terminalu VS Code, w folderze strony, wykonaj:

```powershell
npx.cmd supabase login
npx.cmd supabase functions deploy create-checkout --project-ref mptzogdtgwymlmuqmtmo
npx.cmd supabase functions deploy create-order --project-ref mptzogdtgwymlmuqmtmo
npx.cmd supabase functions deploy ship-order --project-ref mptzogdtgwymlmuqmtmo
npx.cmd supabase functions deploy stripe-webhook --no-verify-jwt --project-ref mptzogdtgwymlmuqmtmo
```

## 3. Stripe — najpierw tryb testowy

Załóż konto Stripe i pozostań w trybie testowym. W **Developers / Workbench → API keys** skopiuj klucz `sk_test_...`.

W **Supabase → Edge Functions → Secrets** dodaj:

```text
STRIPE_SECRET_KEY = sk_test_...
SITE_URL = https://marflorczak.github.io/Amberflo-store
```

W Stripe utwórz webhook:

```text
https://mptzogdtgwymlmuqmtmo.supabase.co/functions/v1/stripe-webhook
```

Zaznacz zdarzenia:

```text
checkout.session.completed
checkout.session.async_payment_succeeded
checkout.session.async_payment_failed
```

Skopiuj sekret webhooka `whsec_...` i dodaj w Supabase:

```text
STRIPE_WEBHOOK_SECRET = whsec_...
```

W Stripe włącz karty, BLIK i Przelewy24 w ustawieniach metod płatności. W ustawieniach wiadomości dla klientów włącz automatyczne potwierdzenia udanych płatności.

## 4. Test płatności

Dodaj produkt do koszyka, wybierz dostawę i płatność online. Na stronie testowej Stripe użyj:

```text
Numer karty: 4242 4242 4242 4242
Data ważności: dowolna przyszła, np. 12/30
CVC: dowolne 3 cyfry, np. 123
Kod pocztowy: dowolny poprawny
```

Po płatności sprawdź:

1. Stripe → Payments — płatność ma status udany.
2. Stripe → Webhooks — zdarzenie ma odpowiedź `200`.
3. Supabase → Table Editor → orders — zamówienie ma status `paid`.
4. Panel Amberflo → Zamówienia — zamówienie jest widoczne.

## 5. Wysyłka i śledzenie

W panelu administratora otwórz **Zamówienia**, wpisz numer przesyłki oraz pełny link do śledzenia i kliknij **Oznacz jako wysłane**.

Bez własnej domeny Resend nie może automatycznie wysyłać wiadomości do klientów. Panel przygotuje gotowy e-mail w programie pocztowym. Gdy w przyszłości zweryfikujesz własną domenę w Resend, ustaw:

```text
FROM_EMAIL = Amberflo <zamowienia@twoja-domena.pl>
SEND_CUSTOMER_EMAILS = true
```

Wtedy potwierdzenie wysyłki będzie wysyłane automatycznie.

## Koszty Stripe

Stripe nie pobiera opłaty za założenie konta ani miesięcznego abonamentu w standardowym planie. Pobiera prowizję od udanych transakcji. Aktualny cennik dla Polski: https://stripe.com/en-pl/pricing
