# Commandes ajoutées pour le projet

Cette page liste les commandes ajoutées utiles pour le projet flairsou.

## import_csv

La commande `import_csv` permet de charger des exports de GnuCASH au format CSV.
La commande fonctionne avec l'appel suivant :

```
python manage.py import_csv structure_comptes.csv transactions.csv [--book BOOK] [--randomize]
```

L'import se base sur deux fichiers CSV différents, **séparés par des point-virgule (`;`)** :
- `structure_comptes.csv` : fichier contenant la structure des comptes
- `transactions.csv` : fichier contenant la liste des transactions

### Fichier de structure des comptes

Pour le fichier de structure des comptes, l'import utilise les colonnes suivantes définies sur la première ligne :
- "Type" : type du compte parmi :
    - "ASSET" ou "BANK" -> compte d'actifs
    - "LIABILITY" ou "CREDIT" -> compte de passifs
    - "EXPENSE" -> compte de dépenses
    - "INCOME" -> compte de recettes
    - "EQUITY" -> compte de capitaux propres
- "Full Account Name" : nom complet du compte, sous la forme "Parent1:Parent2:...:Compte"
    - Note : les comptes doivent être donnés dans un ordre respectant la hiérarchie (le compte "Parent" doit être déclaré avant le compte "Parent:Enfant")
- "Virtuel" : indique si le compte est virtuel ('T') ou non ('F')

Si d'autres colonnes sont présentes dans le fichier, elles sont ignorées.
L'ordre des colonnes dans le fichier n'est pas important.

Exemple de fichier de comptes :

```
Type;Full Account Name;Virtuel
ASSET;Actif;F
ASSET;Actif:Actifs actuels;F
ASSET;Actif:Actifs actuels:Chèques;F
ASSET;Actif:Actifs actuels:Livret A;F
...
```

### Fichier de transactions

Pour le fichier de transactions, on doit avoir une opération par ligne, avec les colonnes suivantesdéfinies sur la première ligne :
- "Date" : date de la transaction au format `JJ/MM/YYYY`
- "Full Account Name" : nom complet du compte concerné par l'opération (doit être cohérent avec le nom complet donné dans le fichier de structure)
- "Description" : label de la transaction
- "Amount Num." : montant associé à la transaction
    - un montant positif correspond à un débit
    - un montant négatif correspond à un crédit
    - l'impact du montant sur le compte dépend de son type (mais ça n'apparaît pas dans la liste des transactions)
    - si le montant est donné en euros, il doit faire apparaître les centimes **après une virgule** (`,`) et non un point, par exemple `123,45`, sans le symbole euros. Il peut aussi être donné directement en centimes : `12345` correspondant à 123.45€.

Si d'autres colonnes sont présentes dans le fichier, elles sont ignorées.
L'ordre des colonnes dans le fichier n'est pas important.

La date est remplie uniquement sur la première opération de la transaction.
Autrement dit, une transaction commence quand une ligne d'opération contient une date, et se termine à partir de la prochaine opération contenant une date.

Une description est toujours associée à la première opération mais pas nécessairement aux autres.
Dans ce cas, si une opération n'a pas de description, la description de l'opération 1 (donc la description de la transaction) lui sera affectée.

Exemple de fichier de transactions :

```
Date;Description;Full Account Name;Amount Num.
16/09/2017;description1;Actif:Actifs actuels:Chèques;180,00
;;Revenus:Cotisations:Cotisations A17-P18;-180,00
27/09/2017;description 2;Actif:Actifs actuels:Chèques;20,00
;;Revenus:Cotisations:Cotisations A17-P18;-20,00
27/09/2017;description 3;Actif:Actifs actuels:Chèques;20,00
;;Revenus:Cotisations:Cotisations A17-P18;-20,00
...
```

La commande a été testée avec des exports de GnuCASH.
Si des fichiers créés à partir d'autres logiciels sont utilisés, les colonnes doivent être ajustées pour correspondre au nom exact et au contenu de la colonne.

### Paramètres optionnels

Le paramètre `--book BOOK` permet de spécifier la clé primaire du livre auquel rattacher les comptes et les transactions créées.
Si aucun livre n'est donné, un nouveau livre est créé avec un nom aléatoire et une entité aléatoire.

Le paramètre `--randomize` permet de randomiser les transactions en remplaçant les labels par des chaînes de caractères aléatoires.
Ceci peut être utile pour fournir une base de données de test pour le développement sans pouvoir identifier les personnes impliquées dans les transactions.

## sync_assos

La commande `sync_assos` permet de créer ou mettre à jour la base locale des associations depuis le portail des assos.
Elle entraîne la création automatique d'un livre pour chaque asso si ce livre n'existe pas, ainsi qu'une structure basique de comptes pour les associations qui gèrent leur trésorerie (commisions, projets et 1901).
