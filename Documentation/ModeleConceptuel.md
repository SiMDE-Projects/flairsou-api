# Modèle conceptuel

Représenté et éditable sur le pad : https://md.picasoft.net/h8vvzYGWSmSiZBVJsDC2OQ?both

```plantuml
@startuml

'Classes

class Entité {
    nom: string
}

class Livre {
    nom: string
}

class EntitéParent
class EntitéEnfant

class Compte {
    nom: string

    /solde
}

class CompteActif
class ComptePassif
class CompteRevenus
class CompteDepenses
class CompteCapitauxPropres

class Budget {
    nom: string
}

class PériodeBudget {
    debut: Date
    fin: Date
}

class PrévisionBudget {
    montant: uint
}

class Transaction{
    fichier: url
    date: date
    pointé: bool
}

class Rapprochement {
    date: date
}

class Opération {
    Crédit: uint
    Débit: uint
    Label: string
}

' Héritages

EntitéParent --|> Entité
EntitéEnfant --|> Entité

CompteActif --|> Compte
ComptePassif --|> Compte
CompteRevenus --|> Compte
CompteDepenses --|> Compte
CompteCapitauxPropres --|> Compte

' Associations

Opération "2..*" --* Transaction
Opération "*" --* Compte
EntitéEnfant "*" --* EntitéParent
Compte "*" --* Compte
Livre "*" --* Entité
Compte "*" --* Livre

Compte *-- "*" Rapprochement

Budget  *-- "*" PériodeBudget
PrévisionBudget "*" --* PériodeBudget
PrévisionBudget "*" --* Compte
Budget "*" --* Livre

@enduml

```

## Modèle logique

Les attributs marqués `#` sont des attributs clés de la relation.

```
Entité (
    #nom : string unique ?
    parent => Entité nullable
)

Livre (
    #nom : string unique ?
    #entite => Entité
)

Compte (
    #nom : string
    parent => Compte(id) nullable
    type : {Actifs, Passifs, Revenus, Dépenses, CapitauxPropres}
    #livre => Livre
)

Opération (
    crédit : uint
    débit : uint
    label : string
    compte => Compte
    transaction => Transaction
)

Transaction (
    date : Date
    pointé : bool
    fichier : url / fichier
)

Rapprochement (
    #compte => Compte
    #date : Date
)
```
