# CLAUDE.md — App Parrucchiere (hairstyle - Copia)

App gestionale per parrucchiere: prenotazioni, gratta-e-vinci fedeltà, funzioni AI (testo + immagini promozionali).
Stack: **React 19 + TypeScript 4.9 + Firebase 11** (Create React App / react-scripts 5).

## Comandi
- Dev: `npm start`
- Build produzione: `npm run build` (output in `build/`, servibile con `npx serve -s build`)
- Typecheck: `npx tsc --noEmit`

## Architettura
- `src/contexts/AppContext.tsx` — **stato globale multi-tenant**. Carica via `onSnapshot` i dati del salone loggato (`currentHairdresserId`, attualmente simulato in `useSimulatedAuth`). Espone dati + funzioni di scrittura su Firestore.
- `src/screens/` — HomeScreen, BookingScreen, AdminScreen.
- `src/components/modals/` — SuperAdminModal (pannello impostazioni), PaymentModal, PaymentSetupModal, ReminderModal, ScratchGameModal, ecc.
- `src/utils/` — `types.ts`, `helpers.ts` (getTodayString/getWeekNumber/getMonthString), `constants.ts`, `firebaseConfig.ts`.
- `src/App.tsx` — root, gestisce navigazione tra screen e contiene la **generazione immagine promozionale attiva** (~riga 1127).

### Doppia API nel context (IMPORTANTE)
Il context è stato refattorizzato a multi-tenant (`employees`, `hairdresserProfile`) ma alcune schermate/modali (Home, Booking, SuperAdmin, Payment, Reminder) usano ancora i **vecchi nomi piatti**. Per farli convivere, `AppContext` espone **alias retro-compatibili** derivati da `hairdresserProfile`:
- `hairdressers` → `employees`
- `salonNameFromFirestore`/`salonAddressFromFirestore`/`salonPhoneFromFirestore`/`salonLogoUrlFromFirestore` → campi di `hairdresserProfile`
- `activePromotionImage` → `hairdresserProfile.activePromotionImageUrl`
- `commissionFee`/`commissionThreshold`/`promotionsGeneratedCount`/`promotionGenerationFee`/`autoPaymentThreshold`/`hairdresserPassword` → da `hairdresserProfile`
- `updateAppSettings` → `updateHairdresserProfile`
- `addHairdresser`/`deleteHairdresser`/`updateHairdresser` → `addEmployee`/`deleteEmployee`/`updateEmployee`

`Employee` è alias di `Hairdresser` (il dipendente). `HairdresserProfile` = l'account salone (estende Hairdresser con i campi impostazioni).

## Firebase / Google Cloud
- Firebase projectId: `salonewebapp`. GCP project: `parrucchiere-463111` (number `891418463221`).
- La chiave in `firebaseConfig.ts` è la chiave client Firebase (**pubblica by-design**, va bene che sia nel bundle).

## Chiavi API
- **Gemini**: presa da `process.env.REACT_APP_GEMINI_API_KEY` (definita in `.env.local`, NON committato). Chiave attuale ristretta solo a `generativelanguage.googleapis.com`.
- La vecchia chiave hardcoded (segnalata "leaked" da Google) è stata rimossa da tutto il codice AI; resta solo come chiave Firebase in `firebaseConfig.ts`.

## Funzioni AI — richiedono BILLING
La quota gratuita Gemini su questo progetto è ~0. Sia **testo** (gemini-2.0-flash) sia **immagini** richiedono billing attivo su Google AI.
- Generazione immagini: modello **`imagen-4.0-generate-001`** (`:predict`). Il vecchio `imagen-3.0-generate-002` era deprecato → aggiornato in `App.tsx` e `AppContext.tsx`.

## Accesso area riservata
- Pannello **SuperAdmin**: cliccare il logo **7 volte** (oppure sequenza tastiera `SUPER_ADMIN_SEQUENCE` in constants).
- Password impostazioni pagamenti in SuperAdmin: `freecent2025`.
- Password area parrucchiere: campo `hairdresserPassword` (default storico `parola`).

## Stato (sessione 2026-06-20)
- Refactor multi-tenant completato a livello di tipi: **0 errori TS**, build di produzione OK.
- Build rigenerato con chiave Gemini nuova e modello imagen-4.0.
- Varianti gemelle su disco (`hairstyle`, `Emergenza`) NON allineate a queste fix.
