# Uruchomienie prywatnego panelu Amberflo

Panel znajduje się pod adresem `admin.html`. Nie ma do niego odnośnika w publicznym menu. Sam brak odnośnika nie jest zabezpieczeniem — dostęp chronią logowanie Supabase i reguły RLS zapisane w `supabase/schema.sql`.

## Pierwsze uruchomienie

1. Utwórz projekt w Supabase.
2. W **SQL Editor** uruchom cały plik `supabase/schema.sql`. Utworzy on produkty, role administratorów, bezpieczne reguły dostępu i magazyn zdjęć.
3. W **Authentication → Users** wybierz **Add user** i utwórz konto administratora z własnym e-mailem oraz mocnym hasłem.
4. Skopiuj UUID utworzonego użytkownika i uruchom w SQL Editor:

```sql
insert into public.admin_users (id)
values ('TU-WKLEJ-UUID-UŻYTKOWNIKA');
```

5. W `config.js` wpisz adres projektu i publiczny klucz `anon`:

```js
window.AMBERFLO_CONFIG = {
  supabaseUrl: "https://ID-PROJEKTU.supabase.co",
  supabaseAnonKey: "PUBLICZNY-KLUCZ-ANON"
};
```

6. Otwórz `admin.html` na opublikowanej stronie i zaloguj się.

## Co można robić

- dodawać i edytować produkty;
- zmieniać ceny, opisy polskie i angielskie oraz parametry;
- wysyłać wiele zdjęć i wybierać zdjęcie główne;
- ukrywać produkt bez jego kasowania;
- zmieniać kolejność produktów;
- usuwać produkty;
- zatwierdzać, odrzucać i usuwać opinie.

Klucza `service_role`, klucza Stripe ani Resend nigdy nie wpisuj do `config.js`. Panel korzysta wyłącznie z bezpiecznego klucza publicznego oraz uprawnień zalogowanego administratora.
