# Cahier des charges Flairsou (version de travail temporaire)

## Objectifs

L'objectif de Flairsou est de fournir une application Web de gestion de comptabilité en **partie double** disposant d'une hiérarchie, adaptée à la gestion de la comptabilité au sein des associations du BDE-UTC.

Le développement s'attachera néanmoins à ne considérer les spécificités BDE-UTC comme des ajouts à une base plus large et réutilisable pour des application de gestion de comptabilité personnelles ou adaptées à d'autres structures.

Pour le BDE-UTC les objectifs sont les suivants :

- Normalisation et centralisation de la comptabilité des associations pour faciliter les passations entre les différents bureaux. Cet objectif répond au turn-over fréquent des trésoriers au sein des associations et au manque de passation entre les bureaux, ainsi qu'aux fréquentes pertes de fichiers de comptabilité.
- Hiérarchisation et centralisation : un tel outil permettra un accès plus simple à la comptabilité des commissions et projets pour les pôles. Ainsi, l'outil disposera d'une fonctionnalité de hiérarchie qui permettra aux pôles d'accéder à la comptabilité de leurs commissions et projets, et de l'intégrer directement dans leurs différents bilans.
- Simplification du travail de trésorerie : l'outil se voudra simple et intuitif, pour permettre une prise en main rapide par les nouveaux trésoriers. La priorité sera donnée à la simplicité et à a documentation des fonctionnalités pultôt qu'à l'implémentation de fonctionnalités de pointe. Cependant, l'outil devra être facilement maintenable afin de permettre l'ajout de fonctionnalités au cours de sa vie.

## Définition des concepts

L'outil se basera sur les concepts de **comptabilité en partie double**.
Certains éléments pourront cependant être simplifiés pour l'accessibilité de celui-ci.

### Crédit / débit (et simplification ?)

Débit vs Crédit : ajouter de l'argent sur un compte d'actifs = débit.
Même si cela rend la gestion simple et lorsque l'on comprend, c'est peu intuitif et peut mener à des erreurs de la part des trésos.
Gnucash utilise d'autres labels (ex : dépenses, revenus) qui sont plus clairs pour l'utilisateur.

Dans le code, on utilisera les sémantiques de débit et de crédit (qui simplifient la gestion de la base de donnée, la vérification des transactions...) mais des labels différents seront affichés pour les utilisateurs (les labels sont indiqués dans les différents types de comptes).

### Comptes et types de comptes

On dispose de comptes "réels" (qui ont un solde et qui permettent des transactions) et des comptes "virtuels" (qui sont les seuls à pouvoir avoir des enfants mais ne peuvent pas faire de transactions).

On une hiérarchie des comptes :
- Un compte a le même type que son père (sauf le compte racine)
- Le solde d'un compte est égal à la somme des soldes des sous-comptes pour les comptes virtuels.

En ce qui concerne la hérarchie des entités, chaque compte d'un enfant sera lié au compte d'un parent pour le regroupement lors des bilans.

#### Comptes d'actifs

Représente les "actifs" (ressources) de l'association (comptes en banque, liquide, chèques, livret A...).

Débiter => Augmenter
Créditer => Réduire

#### Comptes de Capitaux Propres

Utilisés pour faire la cloture et les soldes initiaux.
Par défaut, les comptes de capitaux propres ne peuvent pas être modifiés par les entités (i.e. les entités ne peuvent pas créer de transactions faisant intervenir un compte de capitaux propres).
Une option (flag) présent au niveau de l'entité pourra éventuellement activer cette fonction.

Débiter => Réduire
Créditer => Augmenter


#### Comptes de passif

Représentent les sommes dûes de l'association (prêts, **cartes bancaires**)

Débiter => Paiement
Créditer => Dépense

#### Comptes de dépenses

Représentent les différents postes de dépense de l'association.

Débiter => Dépenses
Créditer => Remises

#### Comptes de revenus

Représentent les différents postes de revenus de l'association.

Débiter => Dépenses
Créditer => Revenus

### Transactions

**NE PAS UTILISER LES FLOAT**

Une transaction est composée de :
- une date
- un ensemble d'au moins deux opérations
- un attribut booléen "pointé"

Une opération représente l'implication d'un compte dans une transaction.
Elle est composée de :
- une référence à un compte
- un montant de débit
- un montant de crédit
- un label

L'attribut "pointé" de la transaction est initialement `faux`, et est passé à `vrai` quand l'entité fait la correspondance avec ce qui est indiqué sur son relevé de compte.

Règles :
- Sommes des débits = Somme des crédits
- Toutes les valeurs de débits et crédits sont >= 0
- Une "opération" au sein d'une transaction a soit Débit soit Crédit nul.
- Une seule opération / compte au sein d'une transaction

Un fichier au format pdf peut être associé à une transaction (factures, justificatifs divers...).

### Rapprochement

Le rapprochement s'appuie sur le relevé de comptes et les transactions pointées. Les transactions pointées ayant une date antérieure au rapprochement du compte ne peuvent plus être modifiées.
On a besoin de : Date / solde intial / solde Final

Pour chaque compte, on stocke l'ensemble des rapprochements effectués.

### Clôture de livre

=> Remise à 0 des comptes de dépense et revenus => compte Résultat (capitaux propres)
Deux transactions réparties :

Dépenses -> crédite tous les comptes dépense / débite Résultat
Revenus -> débite tous les comptes revenus / crédite Résultat

### Bilans

v1 la présentation en AG et imprimer un compte

v1.x le reste :

Bilan de cloture
Relevé recettes/dépenses
Résultat

1 ou 2 jolis graphiques (camembert des dépenses, etc)

### Budget

Mettre en place un système de création et de suivi d'un budget de trésorerie.

* Budget défini sur une période de temps
* Découpé en plusieurs tranches (au mois, à la semaine...)
* Définir les dépenses et recettes prévisionnelles à partir de la structure de comptes définie pour l'entité
* Présentation du solde prévisionnel sur chaque mois à partir d'un solde initial et des cumuls de dépenses et recettes, pour vérifier que le fonds de roulement est suffisant
* Suivi de budget avec comparaison avec les opérations réelles

## Fonctionnement général

On a deux types d'"entités" :
- Les entitées parent, (pôles, 1901)
- Les entités enfant (commissions, projets) qui dépendent d'un parent

Avec le fonctionnement suivant :
- chaque entité a son propre livre
- une entité parente a accès au livre de ses enfants (lecture ou lecture/écriture ?)
- le regroupement des comptes des entités filles peut se faire uniquement au moment de l'édition du bilan et n'est pas forcément nécessaire dans la gestion quotidienne
- hiérarchie dans le bilan de type (Actifs (Pôle (...)) (Asso 1 (...)) (Asso 2 (...))) etc
- possibilité de regrouper les sous-comptes en catégories au moment de l'édition du bilan (feature pour après ?)


Pour la gestion spéciale BDE-UTC: mappage entre le compte CAS et l'entité (association) via les rôles sur le portail.
(vice)Trésorier Club Oeno => droits entité club oeno
Tréso PVDC => droits entité PVDC **DONC** les enfants (commissions/projets)
