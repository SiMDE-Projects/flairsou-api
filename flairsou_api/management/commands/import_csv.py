from django.core.management.base import BaseCommand, CommandError

from flairsou_api.models.account import Account
from flairsou_api.models.book import Book
from flairsou_api.models.transaction import Transaction
from flairsou_api.models.operation import Operation

import django
from django.db import transaction

from typing import TextIO

import csv
import datetime


class Command(BaseCommand):
    """
    Classe Command appelée par manage.py
    """
    help = 'Closes the specified poll for voting'

    def add_arguments(self, parser):
        """
        Ajout des arguments requis pour la commande
        """
        # nom du fichier contenant la structure des comptes
        parser.add_argument('accounts_filename', nargs=1, type=str)
        # nom du fichier contenant les transactions
        parser.add_argument('transactions_filename', nargs=1, type=str)
        # identifiant du livre sur lequel charger les transactions
        parser.add_argument('book_pk', nargs=1, type=int)

    def handle(self, *args, **options):
        """
        Fonction principale appelée par la commande
        """

        # test de l'ouverture des fichiers
        try:
            accountsFile = open(options['accounts_filename'][0], 'r')
        except FileNotFoundError:
            raise CommandError('Le fichier %s n\'existe pas' %
                               options['accounts_filename'][0])

        try:
            transactionsFile = open(options['transactions_filename'][0], 'r')
        except FileNotFoundError:
            raise CommandError('Le fichier %s n\'existe pas' %
                               options['transactions_filename'][0])

        # test de la récupération du livre
        try:
            bookObj = Book.objects.get(id=options['book_pk'][0])
        except Book.DoesNotExist:
            raise CommandError('Le livre %d n\'existe pas' %
                               options['book_pk'][0])

        # on garantit l'atomicité de la transaction en cas d'erreur d'import
        with transaction.atomic():
            # création des comptes
            accounts = createAccountsStructure(accountsFile, bookObj)

            # création des transactions
            createTransactions(transactionsFile, accounts)

        accountsFile.close()
        transactionsFile.close()


def createAccountsStructure(accountsFile: TextIO, bookObj: Book):
    """
    Fonction permettant de créer la structure de comptes à partir du
    fichier contenant la description des comptes, sur le livre indiqué
    """
    # ouverture du fichier csv délimité par des ;
    csvReader = csv.reader(accountsFile, delimiter=';')

    # récupération des indices en fonction des champs qui nous intéressent
    # les noms des champs sont sur la première ligne du fichier et
    # correspondent aux noms des champs générés par gnucash
    iType = 0
    iFullName = 0
    iVirtual = 0

    accounts = {}

    firstRow = True
    for row in csvReader:
        if firstRow:
            firstRow = False
            for i in range(len(row)):
                if row[i] == 'Type':
                    # type du compte
                    iType = i
                if row[i] == 'Full Account Name':
                    # nom complet du compte avec tout son héritage
                    iFullName = i
                if row[i] == 'Virtuel':
                    # compte virtuel ou non
                    iVirtual = i

            # on ne fait pas le traitement avec la première ligne
            continue

        # création du compte et enregistrement de l'objet dans un dictionnaire
        accounts[row[iFullName]] = createAccount(row[iFullName], row[iType],
                                                 row[iVirtual], bookObj,
                                                 accounts)

    # correction du statut virtuel lors de l'import : si un compte non virtuel
    # a des sous-comptes, on le passe en virtuel
    for acc in Account.objects.all():
        if acc.virtual is False:
            if acc.account_set.count() > 0:
                acc.virtual = True
                acc.save()

    # renvoie le dictionnaire pour être utilisé par la suite
    return accounts


def createAccount(accFullNameStr: str, accTypeStr: str, accVirtualStr: str,
                  book: Book, accounts):
    """
    Fonction qui crée un compte à partir des champs extraits du fichier csv
    """
    # détermination du type du compte
    if accTypeStr == "ASSET" or accTypeStr == "BANK":
        accType = Account.AccountType.ASSET
    elif accTypeStr == "LIABILITY" or accTypeStr == "CREDIT":
        accType = Account.AccountType.LIABILITY
    elif accTypeStr == "EXPENSE":
        accType = Account.AccountType.EXPENSE
    elif accTypeStr == "INCOME":
        accType = Account.AccountType.INCOME
    elif accTypeStr == "EQUITY":
        accType = Account.AccountType.EQUITY
    else:
        raise ValueError("Le type de compte est inconnu")

    # récupération du compte parent
    # la valeur de nom complet est au format Parent:Parent:...:Compte
    # on coupe donc sur le dernier ':' et on obtient une liste à deux éléments
    # [nom_compte_parent, nom_final] (sauf si le compte est à la racine, auquel
    # cas on a un seul élément dans la liste résultante)
    nameSplitted = accFullNameStr.rsplit(':', 1)

    if len(nameSplitted) == 1:
        fatherAccount = None
        accName = nameSplitted[0]
    else:
        # récupération du compte parent par le dictionnaire construit
        fatherAccount = accounts[nameSplitted[0]]
        accName = nameSplitted[1]

    # compte virtuel ou non
    if accVirtualStr == 'T':
        accVirtual = True
    elif accVirtualStr == 'F':
        accVirtual = False
    else:
        raise ValueError("Valeur incorrecte pour Virtuel")

    # création du compte
    return Account.objects.create(name=accName,
                                  account_type=accType,
                                  virtual=accVirtual,
                                  parent=fatherAccount,
                                  book=book)


def createTransactions(transactionsFile: TextIO, accounts):
    """
    Fonction de création des transactions à partir du fichier des transactions
    et de la liste des comptes.
    Le fichier est donné avec une opération par ligne. On distingue les
    transactions par les opérations qui sont associées à une date. Le
    principe de l'algoritme de reconstruction est donc d'associer toutes
    les opérations à la même transaction tant qu'on n'a pas trouvé une nouvelle
    date sur une ligne.
    """
    # ouverture du fichier csv limité par des ;
    csvReader = csv.reader(transactionsFile, delimiter=';')

    # récupération des champs intéressants basés sur les noms des champs de
    # l'export gnucash
    iDate = 0
    iAccount = 0
    iLabel = 0
    iAmount = 0

    firstRow = True
    currentTransaction = None

    for row in csvReader:
        if firstRow:
            firstRow = False
            for i in range(len(row)):
                if row[i] == 'Date':
                    # date de la transaction
                    iDate = i
                if row[i] == 'Full Account Name':
                    # nom complet du compte associé
                    iAccount = i
                if row[i] == 'Description':
                    # label de la transaction / opération
                    iLabel = i
                if row[i] == 'Amount Num.':
                    # montant (positif / négatif)
                    iAmount = i
            continue

        # on a trouvé une nouvelle date, on crée une nouvelle transaction
        if row[iDate] != '':
            if currentTransaction is not None:
                # on vérifie qu'on a bien ajouté des opérations, sinon
                # on supprime la transaction
                if currentTransaction.operation_set.count() == 0:
                    currentTransaction.delete()

            # on a une date, donc on a une nouvelle transaction à créer
            date = datetime.datetime.strptime(row[iDate], "%d/%m/%Y").date()
            currentTransaction = Transaction.objects.create(date=date,
                                                            checked=False)
            # le label est porté uniquement par la transaction
            transactionLabel = row[iLabel]

        # on récupère les éléments de l'opération
        account = accounts[row[iAccount]]
        opLabel = transactionLabel if (row[iLabel] == '') else row[iLabel]

        # correction du montant pour enlever la virgule et enlever les espaces
        # étranges mis dans le CSV pour séparer les milliers
        opAmountStr = row[iAmount].replace(',', '')
        opAmountStr = opAmountStr.replace('\u202f', '')
        opAmount = int(opAmountStr)

        if opAmount == 0:
            # on ignore l'opération si le montant est nul
            continue

        # on affecte au crédit ou au débit selon le type du compte
        if opAmount > 0:
            debit = opAmount
            credit = 0
        else:
            credit = abs(opAmount)
            debit = 0

        try:
            # on vérifie qu'une opération associée à cette transaction et à ce
            # compte n'existe pas déjà dans la bdd (contrainte peut-être à
            # lever ?)
            try:
                existingOp = Operation.objects.get(
                    transaction=currentTransaction, account=account)
            except Operation.DoesNotExist:
                existingOp = None

            if existingOp is not None:
                # si une opération est déjà liée à ce compte dans la
                # transaction, on cumule les montants
                existingOp.credit += credit
                existingOp.debit += debit
                existingOp.save()
            else:
                # on crée la nouvelle opération
                Operation.objects.create(transaction=currentTransaction,
                                         account=account,
                                         label=opLabel,
                                         credit=credit,
                                         debit=debit)

        except django.db.utils.IntegrityError as ex:
            # récupération d'une erreur d'intégrité au cas où pour afficher
            # l'erreur
            print('Erreur attrapée dans la transaction :')
            print(currentTransaction.date)
            print(opLabel)
            print(account)
            print(credit)
            print(debit)
            raise ex
