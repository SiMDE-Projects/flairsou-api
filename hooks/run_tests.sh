#!/bin/bash

# fonction de test pour les fichiers python
test_python_file()
{
	# le nom du fichier doit être passé en paramètre
	filename=$1

	# par défaut, les tests sont valides (retour 0)
	local testsOK=0

	# vérification des erreurs de syntaxe / sémantique avec pyflakes
	pyflakes $filename

	if [ $? -ne 0 ];
	then
		echo "Pyflakes a trouvé des erreurs dans le fichier $filename"
		testsOK=1
	fi

	# vérification de la mise en forme avec yapf
	yapf -d $filename > /dev/null

	if [ $? -ne 0 ];
	then
		echo "Le fichier $filename n'est pas bien formaté, utiliser yapf pour corriger."
		testsOK=1
	fi

	return $testsOK
}

echo "Lancement des tests pré-commit..."

# récupérer les fichiers ajoutés au staging area
files=$(git status --porcelain | sed -e 's/^...\(.*\)$/\1/g')

# par défaut, les tests sont valides (donc retour 0)
testsOK=0

# tester chaque fichier ajouté
# le principe est de tester tous les fichiers pour afficher toutes les erreurs
# avant de renvoyer la valeur
for file in $files
do
	# récupération de l'extension du fichier
	extension=$(echo $file | cut -f 2 -d '.')

	case $extension in
		py)
			# tests pour les fichiers python
			test_python_file $file
			;;
		*)
			;;
	esac

	if [ $? -ne 0 ];
	then
		# erreurs dans les tests, on change le retour final
		testsOK=1
	fi
done

# retourner le résultat des tests
exit $testsOK
