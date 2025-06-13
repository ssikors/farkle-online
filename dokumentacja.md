# Farkle Online
Stanisław Sikorski

## Opis projektu
Farkle Online to aplikacja umożliwiająca wieloosobową grę w kości (gra "Farkle") w przęglądarce. Interfejs aplikacji został zaimplementowany z pomocą technologii **Next.js + Typescript**, natomiast serwer i logika gry napisana została w języku **F#** przy wykorzystaniu platformy **.NET + Giraffe**.

## Funkcje aplikacji
- Komunikacja w czasie rzeczywistym przez **SignalR** umożliwiająca aktualizowanie stanu gry na bieżąco
- Interaktywny interfejs użytkownika stworzony przy użyciu **Next.js** 
- Logika gry zaimplementowana zgodnie z paradygmatem funkcyjnym w **F#**

## Struktura projektu
### Backend (F# + .NET + Giraffe)
Foldery `/FarkleApi` i `/FarkleTests` zawierają logikę serwerową aplikacji oraz testy jednostkowe. Wykorzystałem tutaj platformę programistyczną [Giraffe]([afs](https://giraffe.wiki/)), która pozwala na budowanie aplikacji internetowych przy użyciu języka **F#** zgodnie z paradygmatem funkcyjnym.

#### Moduły aplikacji
- **Types** - Przechowuje typy danych używane w aplikacji
- **Repositories** - Zawiera moduł **LobbyRepository** odpowiedzialny za zarządzanie przechowanymi danymi, używany przez następne trzy moduły:
- **GameService** - Zawiera w sobie logikę gry, oceniania rzutów i kombinacji
- **LobbyHandlers** - Implementuje endpointy API umożliwiające tworzenie i dołączanie do gier 
- **LobbyHub** - Implementuje Hub SignalR umożliwiający komunikację w czasie rzeczywistym, obsłuża akcje graczy, aktualizację stan gry i wysyła informacje o zmianach tego stanu użytkownikom

### Paradygmaty funkcyjne
   
#### Czyste funkcje
Funkcje nie mają efektów ubocznych, w większości przypadków też te same dane wejściowe gwarantują ten sam wynik wykonania funkcji.

**Funkcje wyższego rzędu**
```fsharp
updateGameState (lobbyName: string) (updateFn: GameState option -> GameState)
```
Zastosowałem także funkcje wyższego rzędu, choćby tutaj umożliwiają one podanie funkcji modyfikującej stan gry jako argumentu

**Dopasowanie wzorców**
```fsharp
| 6 -> match Set.ofList dice with
        | s when s = Set.ofList [1; 2; 3; 4; 5; 6] -> 1500
        | _ -> match List.sort dice with
                | [1; 2; 3; 4; 5; 5] -> 750 + 50
                | [2; 3; 4; 5; 5; 6] -> 750 + 50
                | [1; 1; 2; 3; 4; 5] -> 750 + 100
                | _ -> scoreRepeated dice
```
Spora część logiki aplikacji, a szczególnie logika gry, wykorzystuje dopasowywanie wzorców (pattern matching) w swoim działaniu

**Logika oparta na danych i wykorzystanie map, fold**
```fsharp
List.fold (
fun acc (value, count) ->
    acc + match count with
            | 3 -> 
                (tripleDiceScores.TryFind value |> Option.defaultValue 0)
            | 4 ->
                (tripleDiceScores.TryFind value |> Option.defaultValue 0) * 2
            | 5 ->
                (tripleDiceScores.TryFind value |> Option.defaultValue 0) * 4
            | 6 ->
                (tripleDiceScores.TryFind value |> Option.defaultValue 0) * 8
            | _ as n ->
                n * (diceScores.TryFind value |> Option.defaultValue 0)
) 0 results
```

#### Niemutowalność danych
Niemutowalność danych jest w głównej mierze przestrzegana jednak są pewne wyjątki, modyfikowany jest stan gry powiązany z daną poczekalnią poprzez słowniki współbieżne (Concurrent Dictionary).


### Frontend (NextJS + TypeScript)
Przeglądarkowy interfejs aplikacji został zaimplementowany przy użyciu platformy **NextJS** z użyciem języka **TypeScript**. Klient obsługuje komunikację RESTową oraz komunikację przez SignalR z backendem.

